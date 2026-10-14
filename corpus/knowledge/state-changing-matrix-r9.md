<!-- corpus entry — tabi-shokunin round 9 (2026-10-14), lane B9-1 (assignment: "the L1 matrix debt: the round-6/7 deferred 'state-changing matrices for the loopback class' — the POST/redirect/replay evidence matrix on the stateful fixture (idempotency classes, the 409/replay cells) lands"). Method: the round-8 stateful fixture (`server.py` v3) reused byte-identical (pin re-derived; the §2 embed of `stateful-fixture-evidence.md` reproduces it) + a replay-cell extension of the round-8 runner/driver, on fresh ports 19881/19882; 9 cells x 2 cold reps plus third reps for the two central cells = 20 runs, all loopback. The 409/replay cells execute the probes round 8 left owed (`stateful-fixture-evidence.md` §9.4 item 4 / §11 U2); the cross-client cells run two independent clients (separate curl jars) against one server. Write scope: this file only — the LOG entry (`AGENTS.md:3`), the corpus/README coverage row, the SKILL distillation and the commit are the integrating round's (r2–r8 pattern). Anti-claim: no external name was resolved or contacted; every fixture byte is lane-authored; session material is shape-only (cookie and one-time-token values are never printed anywhere — length/charset/attribute classes only); nothing filed; no consequential action. Scratch: `/tmp/w9-tabi-b91/` (fixture, harness, 20 run dirs; volatile — archive debt §11). Every hash below is provisional until the archive keeps pace (`cdp-evidence-patterns.md` §5 :92). -->

# State-changing matrix r9 — POST / redirect / replay: the idempotency classes and the 409/replay cells (loopback only)

Scope: `PROVINCE.md:9-13` (CDP session discipline; dynamic-page evidence patterns;
interaction records). Refusals honored (`PROVINCE.md:15-19`): loopback only (one
127.0.0.1 origin), no secrets read, no consequential action, nothing posted
anywhere real. Admission bar: `corpus/QUALITY.md:1-8` — every claim below is an
observation with an anchor (path:line, command, sha), an `[inference]`, or a §11
unknown. Evidence produced 2026-10-14 20:01–20:03Z on this host.

What this note lands, on the record: the **replay half** of the state-changing
matrix deferred since round 6/7 — the per-token-state replay probes, the
`409`/replay cells, the redirect-code replay behaviour, the fresh-token
double-apply, and the cross-client replay contract — on the round-8 stateful
fixture, for the **loopback class**. The step class itself (POST body,
redirect-after-POST 303/307, token minted/consumed, per-cell layer records) was
landed by round 8 (`corpus/knowledge/stateful-fixture-evidence.md`,
`f04e2e473cf9888cea…` / 855 `wc -l` / 50,869 B); this note does not re-run it and
names it as the source of every consolidated row it did not measure. What it does
**not** close is named per item in §1.

## 0. Discipline and method

- **Fixture**: `server.py` v3 (round 8, lane B8-1) — reused **byte-identical**:
  12,311 B / sha256 `ac0013e03288ed28bd79519d9fbfd45814c97824f76dae9b6546c27d6b3ea0cc`
  (one revision across all 20 runs; every `driver.log` prints the pin; the
  cross-artifact check is SC-1 §10). One origin, `http://127.0.0.1:19881`.
- **Ports**: fresh pair 19881/19882 — distinct from every recorded run scratch
  (r8 matrix 19681/19682, AUD-B8 19931/19932, VER-B8-1 19781/19782); the driver
  prechecks both ports empty before every run.
- **Runner**: a copy of round 8's `journey.mjs` (pin `282511320499f1f5…`) plus the
  `replay-*` / `double-apply-fresh-token` cells — my revision
  `cecf3373bceaabdc8807801b6992abd5a30a009df90f7e68c2c193553f63c86a`. Driver
  (ports + cross-client branch) `de31bea55f1aae9caf4c3001795e72019c5ed6aeac4c3dd91ac929732f028141`;
  cross-client arm `curl-replay.sh` `f1763acb73a6f34504c5030278023f8d37a68c35cbe0a303ff86d0f31317c6f8`
  (modeled on round 8's `curl-control.sh`, `8737d42b8c9ac176…`);
  `verify.py` `67883a80d19fcbe9…`; `compare.mjs` `764fec22578c6827…` (cell lists
  updated only).
- **Cold definition**: one rep = new server process (empty state root) + new
  chromium `--user-data-dir` (empty cookie store). N=2 per cell; the two central
  cells additionally ran rep3 (SC-3 §10). 20 runs total, 9 cell dirs, 256
  non-profile run-artifact files.
- **Universal prelude**: every browser cell first navigates to `/` (mints session
  `s1`, visit 1) — recorded as `facts.visit1` and as the first ledger events in
  every cell; all quoted ledger states below include it.
- **Two client faces**: a browser (raw CDP over WebSocket, chromium
  152.0.7977.82) and `curl` 8.22.0 for the cross-client cells (two independent
  jars). Environment: node v24.21.0 · python 3.14.7.
- **State surface**: `/__ledger` — quiet (never logged, never counted), no
  timestamps, no random: `{counter, tokens {minted, consumed, refused}, sessions
  [{ordinal, visits}], events [...]}`. Session ids never leave the server (only
  ordinals); the same surface is what makes cross-client identity statements
  shape-safe.
- **Shape-only discipline**: cookie and token **values are never printed** in
  this note or in any quoted artifact — length + charset class + attribute set
  only. The one place a *value* visibly diverges across reps (the hidden token
  input in a DOMSnapshot, §8.4) is recorded as a shape fact, not a value.
- **Anti-claim**: no external name was resolved or contacted; the server access
  log holds 127.0.0.1 lines only; the fixture and harness are lane-authored (the
  fixture reused from round 8).
- **Sources for the consolidated classes** (§7): rows marked **r8** are round 8's
  measured cells, cited not re-run (`stateful-fixture-evidence.md` §4–§8, incl.
  its E1 independent re-run block); rows marked **r9** are this note's.

## 1. The debt this lands — and the boundary (lineage, mechanical)

| # | Debt item | Where recorded | Status now |
|---|---|---|---|
| a | **r7 L1a–L1e** — POST body / redirect-after-POST 303 vs 307 / token-once / replay contract / per-cell layer record | `plans/round-7-record-draft.md` §3 :119-123 (all five NOT LANDED) | **landed for the loopback class** by r8's note (L1a–L1c, L1e) — this note lands the replay half (L1d) with the owed cells |
| b | r8's owed replay probes — "the replay itself was **not** run" (§9.4 item 4) and "whether the token remains usable after a guarded skip … the replay-after-skip probe is owed" (§11 U2) | `stateful-fixture-evidence.md` §9.4 :653-657, §11 U2 :746-747 | **landed** (§3, §5; U2 closed) |
| c | the **cross-run/stateful-client** reading of the replay contract — "executed twice by two independent cold clients; what the token binds to; whether the resource double-applies" | `plans/round-9.plan.md` §L1 :291-312 | **partially landed** — §5/§6 measure two independent clients and the double-apply; the *cookie lifecycle across a browser restart* and the *freshness scope* (cache × cookie) are **not** this note's cells (unknowns U2/U8) |
| d | **r6 L1 — the wire-class / cache-revalidation matrix** for repeated same-URL subresources | `carried-debt-closure-r8.md` §2 (STILL OPEN at r8 close); `layer-routing-synthesis.md:136-140` | **not touched here** — different matrix (no state-changing step); still open |
| e | E3 third-party-JS-shaped async (late settle, beacon-shaped POST, canceled 404) | `external-class-fixture-v2.md` §9 :560-563 | not touched here; carried |
| f | real-site classes / the r8 list beyond the matrix (nav-cancel mechanism, `requestId` grouping, refusal-code generality) | `stateful-fixture-evidence.md` §11 U3–U10 | cited as still open where my cells touch the same surface (§11) |

Citation finding (append-only, not repaired): the r8 note's §9.4 item 4 names
"unknown U5" for the replay-after-skip probe while its §11 names the same object
**U2**; the substantive statement is identical in both, and this note treats the
probe as **U2's object**, citing §11's numbering. [observation]

## 2. The matrix — planned vs completed

Cell plan fixed before the run: one factor per cell; every browser cell reuses
the identical replay body bytes for the original and the replayed attempt
(`driver` logs print body lengths only). 9 cells × 2 cold reps (+ 2 × rep3) = 20
runs; **0 journey errors** — 18/18 matrix runs exit 0 in
`/tmp/w9-tabi-b91/run-all.log`, the two rep3 runs exit 0 (SC-3 §10).

| # | cell | the one factor | N | status |
|---|---|---|---|---|
| 1 | `replay-guard-skip` | token **unconsumed** (guarded skip) → same POST replayed | 3 | complete |
| 2 | `replay-consumed-pre` | token consumed by **apply-before-hold** (interrupt-pre) → replayed | 3 | complete |
| 3 | `replay-consumed-post` | token consumed by **apply-after-hold** (interrupt-post) → replayed | 2 | complete |
| 4 | `replay-unknown-token` | token **never minted** → submitted | 2 | complete |
| 5 | `replay-terminus` | completed submit+303 → POST replayed, then GET terminus replayed twice | 2 | complete |
| 6 | `double-apply-fresh-token` | form **re-rendered** (fresh token) → submitted | 2 | complete |
| 7 | `replay-307` | method-preserving chain (307) submitted twice, same bytes | 2 | complete |
| 8 | `xclient-consume` | **client identity** at first consumption (A mints, B consumes, then B and A replay) | 2 | complete |
| 9 | `xclient-sessions` | **client identity** for visit state (A/B independent, A revisits) | 2 | complete |

Completion: **9/9 cells × 2/2 reps** (7/7 browser cells with digest-identical
reps — SC-2 §10); every cell's `closure.txt` carries `pass: no chromium process
…` + `pass: ports 19881/19882 not listening` + `curl cdp exit=7` + `curl http
exit=7` (20/20 closure files: 18 matrix runs + 2 rep3).

## 3. Measured — the 409/replay cells (the token-state matrix)

The probe is one repeated request: **the same form-encoded POST bytes** sent
again, from the same client, after the state in column 1 was established. The
replay's client surface and the server's decision per token state:

| token state at replay time | cell | client outcome (fetch) | ledger at replay | counter | decided by |
|---|---|---|---|---|---|
| **unconsumed** — the guarded arm skipped the apply (`apply-skipped reason=client-gone`) | `replay-guard-skip` | `{200, redirected: true, → /result}` | `apply(mode=pre, bodyBytes 50)` | `1` | server token table; replay accepted and applies |
| **consumed** by apply-before-hold | `replay-consumed-pre` | `{409, redirected: false, → /submit}` | `submit-refused(token-consumed, bodyBytes 52)` | `1` (unchanged) | server token table |
| **consumed** by apply-after-hold | `replay-consumed-post` | `{409, redirected: false}` | `submit-refused(token-consumed, bodyBytes 53)` | `1` (unchanged) | server token table |
| **consumed** by a completed submit (+303 follow) | `replay-terminus` | `{409, redirected: false}` | `submit-refused(token-consumed, bodyBytes 48)` | `1` (unchanged) | server token table |
| **never minted** (`0123456789abcdef`) | `replay-unknown-token` | `{409, redirected: false}` | `submit-refused(unknown-token, bodyBytes 40)` | `0` | server token table |
| **fresh** (re-rendered form) | `double-apply-fresh-token` | `{200, redirected: true, → /result}` | `apply(mode=pre)` after a second `token-mint` | `2` | server token table: a new token applies again (§5) |

The three consumption paths (before-hold, after-hold, completed) are
**indistinguishable at the replay**: identical 409 + `submit-refused
(token-consumed)` + counter unchanged. The guard arm is the only state whose
replay is accepted. Token arithmetic per cell (rep-invariant, both reps):
`replay-guard-skip {minted 1, consumed 1, refused 0}` · `consumed-pre/post
{minted 1, consumed 1, refused 1}` · `unknown-token {0, 0, 1}` · `terminus
{1, 1, 1}`.

Server log, `replay-consumed-post` rep1 (`runs/replay-consumed-post/rep1/http.log`,
verbatim; the abort-marker line is the fixture's own):

```
127.0.0.1 - - [14/Oct/2026 17:01:49] "GET /form HTTP/1.1" 200 -
127.0.0.1 - - [14/Oct/2026 17:01:49] "POST /submit?apply=post&hold=700 HTTP/1.1" 303 -
== ABORTED response write (client closed): /submit?apply=post&hold=700
127.0.0.1 - - [14/Oct/2026 17:01:50] "POST /submit HTTP/1.1" 409 -
```

Server log, `replay-guard-skip` rep1 — the two lines that close U2 (the skip,
then the replay's apply reaching `/result`):

```
127.0.0.1 - - [14/Oct/2026 17:01:32] "POST /submit?apply=post&hold=700&guard=1 HTTP/1.1" 303 -
== ABORTED response write (client closed): /submit?apply=post&hold=700&guard=1
127.0.0.1 - - [14/Oct/2026 17:01:32] "POST /submit HTTP/1.1" 303 -
127.0.0.1 - - [14/Oct/2026 17:01:32] "GET /result HTTP/1.1" 200 -
```

**U2 closed (observation).** After the guarded arm's `apply-skipped`, the token is
**not** consumed; the same request replayed is accepted, consumes the token, and
applies `counter 0 → 1` (rep1/rep2/rep3 identical ledgers). The abandoned attempt
is therefore recoverable exactly once — and the replay is what recovers it.

**The replay as a discriminator (observation + [inference]).** Round 8 measured
that the three abort arms are indistinguishable to the client *at the moment of
abandonment* (its §7.1, R5/R6); this note adds that the **same-request replay
discriminates them**: `200` ⇒ the token had survived (skip) and the replay itself
applied; `409` ⇒ the token had been consumed (either apply timing). The
discriminating probe pays one apply in the survived case. Falsifier under §9 M5.

## 4. Measured — the redirect half (terminus replay; 307 replay)

**`replay-terminus` (`/result` replayed after a completed 303 chain).** The POST
applied (`counter 1`), its replay was refused (409, §3); then the terminus URL was
navigated twice: both landings render `data-counter="1"` / `data-visits="1"`
(`facts.terminus1 == facts.terminus2`), the ledger gains only `write-ok(/result)`
lines, and `counter`/`visits`/`tokens` are unchanged by either navigation. The GET
terminus of a 303 chain is replay-stable; the POST that produced it is not.

**`replay-307` (method-preserving chain replayed).** Two identical fetch POSTs to
`/echo307`, same 8-byte body: both client results are
`{status: 200, redirected: true, finalUrl /echo307-target, text: {"method":
"POST", "bodyBytes": 8}}`; the server log carries two `POST /echo307 … 307` lines
and two `POST /echo307-target … 200` lines; the ledger stays `counter 0`,
`tokens {0,0,0}` — eight events, none a token or apply event. A 307 replay
preserves method and body and touches no server state (this is the class's
idempotent-by-construction control).

## 5. Measured — double apply via a fresh token

`double-apply-fresh-token`: submit with the rendered token (applies, `counter 1`),
then `fetch('/form')` re-renders — minting a **second** token — and the second
token is submitted with the same body. Both client results `{200, redirected:
true → /result}`; the in-page comparison reports `t1Shape == t2Shape` (16 hex
each) and **`distinct: true`**; the ledger: `token-mint ×2`, `apply(mode=pre) ×2`,
`counter 2`, `tokens {minted 2, consumed 2, refused 0}`; the result page renders
`data-counter="2"`.

The non-idempotent resource is guarded **per token, not per resource**: re-entering
the step through a fresh render double-applies. The token is an *attempt* guard
(a nonce), not a resource-idempotency key — [inference]: the fixture has no
resource identity, so nothing in it could deduplicate two distinct attempts;
this is by construction, and the measured statement is only the arithmetic above.

## 6. Measured — cross-client (two independent clients, one server)

Both cells: client A = a curl jar that renders `/form`; client B = a fresh curl
jar that never rendered anything. One server process, sequential requests.

**`xclient-consume` — what the token binds to.** A's render mints token T in A's
request (A gets session `s1`); **B submits T** — the identical body bytes
(`token=<T>&note=xclient`, 35 B; reused for all three submits): `303`,
`Location: /result` — accepted, `counter 0 → 1`.
Then **B replays**: `409`. Then **A replays**: `409`. Ledger: `counter 1`,
`tokens {minted 1, consumed 1, refused 2}`, sessions `[{s1, 0}, {s2, 0}]`, and the
`apply` event records **`sid: null`** — B had no session when it consumed the
token. Both jars end with one `tabi_sid` cookie (16 lower-hex, `Path=/`,
`HttpOnly` prefix in the jar, `expires=0` session class — shape only).

**The token binds to nothing server-side** — not to the minting session, not to
the client, not to a run: any client presenting it consumes it, and every later
replay, from *either* client, is refused by the same table. [observation]

**`xclient-sessions` — what outlives a client.** A visits `/` twice, B once:
A's page reads `data-visits 1 → 2`, B's reads `1`; ledger `sessions [{s1, 2},
{s2, 1}]`, `counter 0`. Session identity and its visits counter are per-client
(cookie-carried); the second cold client neither inherits nor perturbs the first.

## 7. The idempotency classes (consolidated; source named per row)

Classes are defined by (method, redirect, token, state effect) and the measured
replay outcome. r8 rows are its note's cells, cited; r9 rows are this note's.

| class | instance | replay of the same request bytes | state effect of replay | source |
|---|---|---|---|---|
| **S — safe read** | GET `/result` (replayed ×2), GET `/away` (single navigation) | identical response; no counter/token change | none | r8 (`curl-control` + `post-303` terminus reads) + r9 (§4 terminus ×2) |
| **C — counted GET** | GET `/` (visit counter) | not idempotent on the visits counter: `visits 1 → 2` | visits +1 | r8 (`multi-visit`, `curl-control`) + r9 (`xclient-sessions`) |
| **M — method-preserving redirect, no state** | POST `/echo307` → `307` → POST `/echo307-target` | identical `{200, POST, bodyBytes 8}`; no state | none | r8 (`post-307`, once) + r9 (`replay-307`, twice) |
| **A — token-gated apply, unconsumed** | POST `/submit` with an unused token | accepted once: `303 → /result`, `apply` | `counter` +1, token consumed | r8 (`token-once` first arm) + r9 (`replay-guard-skip`, after a guarded skip) |
| **R — token-gated apply, consumed** | POST `/submit` with a used token | refused: `409`, no redirect, no state | none | r8 (`token-once` replay, `dup-submit` loser) + r9 (three consumption paths, §3) |
| **U — unknown token** | POST `/submit` with a never-minted token | refused: `409`, `unknown-token` | none | r9 (`replay-unknown-token`) |
| **F — fresh token re-apply** | POST `/submit` after a re-render | accepted, applies again | `counter` +1 per fresh token | r9 (`double-apply-fresh-token`) |
| **X — abandoned, applied** | POST aborted mid-hold, `apply=pre` or `apply=post` | replay → **R** (409); state keeps the first apply | none on replay | r8 (§7.1) + r9 (`replay-consumed-pre/post`) |
| **X′ — abandoned, skipped** | POST aborted mid-hold, `guard=1` (socket-aware) | replay → **A** (accepted; applies) | `counter` +1 (the replay's) | r8 (§7.1 skip ledgers) + r9 (`replay-guard-skip`) |
| **D — duplicate, one token** | two parallel identical submits | one winner (303/200-redirect), one refused (409) | one apply | r8 (`dup-submit`; ledger event order unstable, outcomes stable) |

## 8. The replay contract (as exercised on this fixture)

1. **The server's token table decides; nothing else does.** Same bytes, same
   token state ⇒ same outcome, for every client identity tested (two independent
   curl clients; browser and curl). The client-visible codes: `200
   redirected:true → /result` (accepted) or `409 redirected:false` (refused);
   the refusal is identical on the wire (`wire 409 → resp 409` in every r9
   refusal), and an accepted POST's own 303 is a wire+server fact while the
   client face reports the terminus (rule 3 below).
2. **The token is attempt-scoped**: consumed exactly once by the accepted
   attempt; an abandoned attempt consumes it *iff* the server applied
   (before/after hold) and not when the guarded check skipped; a fresh render
   mints a new one that applies again. The token binds to no session, client, or
   run (§6).
3. **Redirect code shapes the replay**: 303 turns the follow-up into a GET
   (terminus replay-stable); 307 preserves POST + body (replay yields the same
   result and no state). The POST's own status exists only at wire + server (r8's
   R3 holds in every r9 redirect cell).
4. **Byte-identity**: rep-to-rep identity holds on `facts.json` (7/7 browser
   cells), `http.log` normalized (9/9 cells), `ledger-after.json` (9/9 cells),
   and every PNG capture compared (10/10 rep1↔rep2 pairs; the four rep3 captures
   are also byte-equal to rep1 — SC-3); the two central cells hold across three
   reps.
   **Divergence class measured, not averaged**: in the three abort cells the
   `DOMSnapshot`/shape captures differ across cold reps by exactly **one changed
   line** — the hidden `#token` input's `value` (the per-run nonce) — while the
   PNG pixels are identical (the input is hidden). A DOM capture of a
   token-bearing page is non-reproducible by construction; the pixel surface is.
   [observation; r8's "all PNGs identical" claim re-observed on the 10
   rep1↔rep2 capture pairs, plus the four rep3 captures]
5. **Closure per run**: 20/20 closures (18 matrix runs + 2 rep3) — kill by PID
   from the process table, both ports closed, `curl` exit 7 on both endpoints,
   no residual chromium or fixture process (§10 SC-3).
6. **A replayed token after an interrupt** (r8 §9.4 item 4, previously
   "not run"): measured in §3 — refused in both applied arms; accepted (and this
   note's only state-changing replay) in the skipped arm.

## 9. Rules added (each with a falsifier)

- **M1 — Replay outcome is a function of token state alone** (unused → apply once;
  consumed → 409; unknown → 409), independent of client identity, session, or
  run. *Falsifier:* a replay whose outcome differs between two cold clients for
  the same token state.
- **M2 — A guarded skip does not burn the token** (closes r8 U2): after
  `apply-skipped(client-gone)`, the same request replayed is accepted and applies
  once; `counter 1`, `consumed 1`, `refused 0` — 3/3 cold reps. *Falsifier:* a
  guard-arm run whose token is already consumed at replay time (or whose replay
  applies twice).
- **M3 — An abandoned-and-applied POST burns the token in both timing arms**;
  the replay is refused (409) and the counter stays at the first apply
  (2/2 + 2/2 runs). *Falsifier:* a replay after apply-before/after-hold that
  applies again (`counter 2`).
- **M4 — A fresh token re-applies the resource** (double-apply by design):
  `counter 1 → 2`, `minted 2 / consumed 2` while both tokens were single-use.
  *Falsifier:* a fresh-token submit refused, or accepted without a counter move.
- **M5 — The same-request replay discriminates the abort arms for the client**:
  409 ⇒ token had been consumed (applied); 200 ⇒ the token had survived (skip)
  and the replay applied. *Falsifier:* an abort arm whose replay is ambiguous
  (e.g. both classes 303) or an arm where the replay outcome contradicts the
  ledger's skip/apply record.
- **M6 — The 303 terminus is replay-stable while its POST is not; the 307 chain
  replays identically.** *Falsifier:* a terminus navigation that moves `counter`
  or `visits`, or a 307 replay that changes method/body or touches state.
- **M7 — Cross-client: the token is consumable by any client and every later
  replay is refused; sessions/visits stay per-client.** *Falsifier:* a token
  refused for a non-minting client while unconsumed, or a visits counter shared
  across two clients' jars.
- **M8 — Capture determinism is per artifact**: PNG byte-identical across cold
  reps; DOM shape diverges by exactly the hidden token input's value on
  token-bearing pages. *Falsifier:* a PNG that differs across reps, or a shape
  divergence elsewhere than the token attribute.

## 10. Verification (this lane) and spot-checks

- **Digests**: `node compare.mjs` → `facts/http/ledger = yes` for **9/9 cells**,
  `closure closed/closed` for **9/9** (`/tmp/w9-tabi-b91/matrix.tsv`, plus
  `compare-out.txt`). Python `verify.py` (kind-separated event chains + client
  facts, timings stripped): **ALL_IDENTICAL**, 7/7 browser cells, per-cell digest
  shas in `/tmp/w9-tabi-b91/verify-out.txt`.
- **Counts**: 20 runs, 20 exits 0, 0 journey errors; 256 non-profile artifact
  files; token arithmetic per cell rep-invariant (§3).
- **SC-1 — fixture pin equality (cross-artifact).** The `§2` python fence of
  `stateful-fixture-evidence.md` extracts to 12,312 B, `836169c55b3a54fc…`; minus
  the fence's final newline it is 12,311 B / `ac0013e03288ed28…` — equal to
  (i) the r8 note's own pin and (ii) the bytes this lane ran (re-hashed from
  `/tmp/w9-tabi-b91/server.py`). The audit's finding 5.3 (fence-newline
  convention) reproduces; no byte differs.
- **SC-2 — rep-to-rep identity, mechanically.** `verify.py` and `compare.mjs`
  (adapted from round 8's, cell lists updated) were run over the raw
  `journey.json`/`facts.json`/`http.log`/`ledger-after.json`; every quoted number
  in §3–§7 was re-read from those files at write time. A **non-author re-run** of
  these replay cells (the r8 VER-B8-1 / AUD-B8 pattern) is **owed** — no
  independent seat has re-run this note's cells.
- **SC-3 — a third cold rep for the two central cells** (not part of N=2):
  `replay-guard-skip` and `replay-consumed-pre` rep3 exit 0; digest sha equals
  rep1/rep2 (`ec26a525bc7c6537` / `ab95cdd4b0b002a7`); `ledger-after.json` equal
  across all three reps; closures pass. The U2 closure is 3-rep.
- **SC-4 — closure sweep (all runs)** — ports/process/ping check per run
  (§8.5); at write time: 0 chromium processes for this scratch
  (`ps -eo args | grep 'user-data-dir=/tmp/w9-tabi-b9[1]'`), 0 `server.py`
  processes, both ports free (`ss -ltn`).
- **Citation check**: the r8 note's pin used in this note (`f04e2e473cf9888cea…`
  / 855 `wc -l` / 50,869 B) was re-derived from the committed tree at write time
  (HEAD `6a8861c`), not copied from an earlier draft.

## 11. Archive debt and unknowns

**Archive debt.** Everything durable lives in `/tmp/w9-tabi-b91/`: `server.py`,
`journey.mjs`, `driver.sh`, `curl-replay.sh`, `verify.py`, `compare.mjs`,
`run-all-replay.sh`, `run-all.log`, `matrix.tsv`, `verify-out.txt`,
`compare-out.txt`, and `runs/<cell>/rep<N>/`
(20 run dirs: `journey.json`, `facts.json`, `ledger-before/after.json`,
`http.log`, `closure.txt`, `driver.log`, `chromium.log`, PNG/DOMSnapshot/shape
captures; `clientA/B.jar` for the cross-client cells). The archive seat must copy
the group into `corpus/evidence/` with a `MANIFEST.txt`
(`cdp-evidence-patterns.md` §5 :92). Every hash in this note is provisional until
then. Gone irrecoverably: nothing (unlike r8's runner, each revision here was
copied before editing).

**Unknowns (do not convert to claims without a new probe).**

- **U1.** The guard race: `client-gone` was read true in every guard run at
  hold 700 ms vs abort 150 ms; short holds (detection before the FIN propagates)
  untested — r8's U1 stands.
- **U2.** The cross-client cells are curl-only (no CDP surfaces); a two-browser
  cross-client pair (two cold profiles) was not run — the client-identity
  statements rest on the server + curl surfaces.
- **U3.** A human-facing re-submit (browser Back + re-POST, or the resubmission
  dialog) was not exercised; `double-apply-fresh-token` re-rendered via `fetch`.
- **U4.** Token expiry/unboundedness: the fixture's table never expires and has
  no size limit; replay-after-expiry and table-growth behaviour untested.
- **U5.** Body modification with the same token (changed `note` field) was not
  run; the fixture's accept condition reads the token only — untested here.
- **U6.** Two independent clients replaying the same token *simultaneously*
  (cross-client race) was not run; r8's same-client `dup-submit` is the nearest
  datum (U10 there).
- **U7.** `SameSite`/`Secure`/cross-origin behaviour untested (single-origin
  loopback), as r8 U7; session expiry/re-mint untested (r8 U8).
- **U8.** The **cookie lifecycle across a browser restart** in one profile (the
  plan's L1 bullet 1) and the **cache × cookie freshness scope** (bullet 3, the
  r6 matrix's extension) are not this note's cells; the r6 cache-revalidation
  matrix remains unlanded (`carried-debt-closure-r8.md` §2).
- **U9.** The refusal *code* (409) is the fixture's choice (r8 U6 holds): the
  measured statement is "a refusal with no state change", not "409" on real
  servers. A loopback 429 remains never a C6 datum
  (`external-class-fixture-v2.md` §8 :508-517).
- **U10.** Navigation-level cancel semantics (r8 U4) and CDP `requestId`
  grouping (r8 U5) were not re-probed; my cells reuse the same runner.

## 12. Errata (append-only — never edit above blocks)

- *(none yet)*