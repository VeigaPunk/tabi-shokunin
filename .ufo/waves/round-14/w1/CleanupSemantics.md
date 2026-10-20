# Round-13 ARIA `listeningAfter`: observed proof and summary inversion

## Scope and axes

Read-only reconstruction of `scripts/aria-loopback-round13.mjs` and the committed `corpus/evidence/round-13/aria/receipt.json`, using the runner spec only to locate the producer of its proof fields. No code, historical receipt, or pin was edited; no build, test, lint, format, smoke, or selftest was run.

Axes: raw per-worker observation vs derived aggregate predicate; source-to-receipt provenance; exact ceiling of the teardown proof.

## Evidence chain

1. **Producer records the raw signal.** `corpus/evidence/round-13/aria/aria-loopback.spec.mjs:472-499` initializes the proof, awaits `SERVER.close(...)`, sets `closed = true` on callback, samples `SERVER.listening` directly into `proof.listeningAfter`, then performs one fetch to the same loopback fixture URL. Any fetch rejection sets `refusedAfterClose = true`; its cause code/name is retained as `refusalDetail`. Worker cleanup requires `closed`, raw `listeningAfter === false`, and `refusedAfterClose === true` (`aria-loopback.spec.mjs:1255`).
2. **Worker proof survives into the receipt.** The committed receipt's `cleanup.server.perWorker[0]` records `listeningBefore: true`, `closed: true`, `listeningAfter: false`, `refusedAfterClose: true`, `refusalDetail: "ECONNREFUSED"`, and `closeError: null`. It has one worker. Its aggregate worker cleanup and `R13-ARIA-CLEANUP-01` are pass.
3. **Launcher checks raw worker values correctly.** `scripts/aria-loopback-round13.mjs:439-444` requires at least one worker, one server proof per worker, and for every proof `closed === true && listeningAfter === false && refusedAfterClose === true`. The cleanup finding uses that `serverOk` (`:491`); the detailed worker proof is kept in `cleanup.server.perWorker` (`:603-609`).
4. **The top-level field is inverted during serialization.** At `scripts/aria-loopback-round13.mjs:603-609`, `cleanup.server.listeningAfter` is assigned `serverProofs.every(proof => proof.listeningAfter === false)`. That expression is an **all-workers-not-listening predicate**, not the raw `Server.listening` observation. For this receipt it evaluates to `true`, while the retained per-worker raw observation is `false`. `cleanup.server.ok` remains true because its check at `:439-443` uses the raw worker value.
5. **Content hashes line up.** The receipt records launcher SHA-256 `1d54c9e98a85022c4382d0a0eeb16e15f0256b7f561329258e7ca77152e4af9c`, matching the current launcher bytes. Its recorded spec SHA-256 `03cb4e17d3b02785335dfd55df4717fbe18edf637d7defe043f8328ba9d7e4fc` also matches the current spec bytes. These are byte-identity checks, not a signature or an independent execution attestation.

## Exact interpretation

The `true` at committed `receipt.json` → `cleanup.server.listeningAfter` is not evidence that the server remained listening, and does not contradict `cleanup.server.perWorker[0].listeningAfter: false`. It is the result of applying `every(raw === false)` and storing that result under the raw-observation name. The original worker-level proof and the launcher's cleanup pass predicate are consistent: the one worker was observed listening before closure, its close callback completed, Node reported `SERVER.listening === false` afterward, and a post-close request to that loopback origin produced `ECONNREFUSED`.

The proof ceiling is narrower than “server is globally unreachable”: it supports Node's server-state report and one failed post-close request to the recorded loopback origin. The code marks `refusedAfterClose` on any fetch rejection, so the specific `ECONNREFUSED` detail in this receipt matters. It does not prove no-egress from the host, all interfaces/ports/addresses unreachable, all possible requests refused, or kernel-level teardown beyond the API state and this request. The receipt itself scopes the network claim to page-level exact-origin confinement and explicitly disclaims global host no-egress (`receipt.json` → `server.claimScope`).

## Repair invariants for ReceiptRepair

- Keep each worker's `listeningAfter` as the raw `Server.listening` sample.
- Keep the cleanup verdict equivalent to: nonempty workers; proof count equals worker count; every proof has `closed === true`, raw `listeningAfter === false`, and `refusedAfterClose === true`.
- Do not serialize `every(raw === false)` as a field named `listeningAfter`. Preserve the per-worker values and either omit a redundant aggregate state or name the derived Boolean explicitly (for example, `allNotListeningAfter`). If an aggregate must represent the raw state, encode worker observations rather than one Boolean whose meaning changes with worker count.
- Leave the original receipt/pin bytes and their historical runtime record intact; this analysis did not execute a new browser run.

## Confidence / method note

High confidence for the inversion and the stated receipt values: both the launcher and spec source hashes recorded in the receipt match current bytes, and the relevant producer, aggregation, and stored JSON fields were read directly. No LSP device was exposed in the supplied tool inventory; text search was used only to locate references, not as semantic proof. The semantic claims above are based on the displayed source ranges and receipt fields.