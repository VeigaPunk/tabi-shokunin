# geckodriver / Firefox behaviours the driver had to accommodate

Seat: ExecFirefoxDriver (round 35, w1, item C2 build). Companion to
`bidi-firefox-loopback-round35.mjs` and the committed receipt. Everything below was observed in
this seat's own runs on Firefox 158.0.1 through geckodriver 0.37.1, not read from a doc, unless it
names S134.

1. **geckodriver's BiDi socket defaults to 9222 (S134).** `--websocket-port PORT` — "Port to use
   to connect to WebDriver BiDi. Defaults to 9222." Every launch pins a free port for `--port`
   (classic) and a different free port for `--websocket-port` (BiDi); the driver refuses (exit 2)
   if either draw is 9222, because 127.0.0.1:9222 is the operator's CDP lease.
2. **Firefox does not serve BiDi itself.** geckodriver brokers the session; the classic
   `POST /session` body carries `webSocketUrl` only when the capability is requested, and the
   socket path is `/session/<sessionId>`. Ending the session is `DELETE /session/<sessionId>`, and
   the browser is reaped by killing geckodriver's process group (geckodriver spawns Firefox and
   Firefox spawns content processes in that group).
3. **Id shapes are UUIDs, not Chromium's hex.** `sessionId`, browsing-context ids from
   `browsingContext.getTree`, and the `sharedId`s returned by `browsingContext.locateNodes` are
   all lowercase UUIDs. A Chromium-shaped receipt check (32 lowercase hex session id, 32 uppercase
   hex context id) refuses these transcripts outright; the round-35 C2 counter checks UUID shape
   and refuses Chromium's.
4. **`network.getData` returns text bytes as `{type: "string"}`.** Chromium's transcripts carry
   `{type: "base64"}` for the same body; a decoder that assumes one encoding fails on the other.
5. **Header serialisation differs.** Firefox gives header `name` as a plain string and `value` as
   `{type: "string", value}` — e.g. `{name: "x-tabi-fixture", value: {type: "string", value:
   "r32"}}`. The fixture server's own `Date`, `Connection`, `Keep-Alive` and `Transfer-Encoding`
   headers also appear in `responseCompleted`.
6. **Firefox fetches `favicon.ico` on its own.** Each document load produces a `favicon.ico`
   request that the fixture answers 404 (§1's 404 branch): three per run, ignored by every
   predicate but present in the transcripts.
7. **Prompts need `unhandledPromptBehavior: "ignore"`.** With that capability the
   `browsingContext.userPromptOpened` event carries `handler: "ignore"` and
   `userContext: "default"`, and the alert stays open until an explicit
   `browsingContext.handleUserPrompt` — which is exactly what row R17's predicate wants; without
   the capability the prompt would be dismissed or would block the next command.
8. **The realm is replaced by `browsingContext.traverseHistory`.** Reads taken in the gap can fail
   with a context/realm error, so `location.pathname` is read in a bounded retry loop that records
   every attempt; only a successful read counts for R14. In these runs the first attempt after the
   traversal succeeded in both runs.
9. **Screenshot determinism is per build, and it held.** The first screenshot (taken after
   `setViewport 640x480`, a complete `/a.html` navigate and the awaited `window.__ready`, before
   any input action) is a 9,451-byte 640x480 PNG with sha256
   `7a3ae6a9b0d65497f52ec1ed6ddea1970e32025e0fb8a36d2debdfc201cbfd02` in all four sessions this
   seat recorded: run1, run2, the counter's own live session, and the extra re-run kept in
   `repro-rerun-NOT-COMMITTED/`. No screenshot may be taken before that point, or the counter's
   first-screenshot binding cannot match.
10. **Firefox needs writable `HOME` and `XDG_*`.** The profile root must already exist, and the
    launch passes `-headless` in `moz:firefoxOptions.args`, `MOZ_HEADLESS=1`, and `--binary` on
    geckodriver's own command line (no `moz:firefoxOptions.binary` needed).
11. **geckodriver accepts `/session` only after it is listening.** The driver polls the classic
    endpoint (100 x 200 ms) rather than sleeping a fixed time; Firefox's first launch in a cold
    profile is the slow part, not geckodriver's port bind.
12. **`repro-rerun-NOT-COMMITTED/` is evidence, not a deliverable.** It holds a third and fourth
    driver invocation from the same commit, with its own session ids, ports and transcript
    digests, all predicate-clean and with the same first-screenshot digest. Do not commit it into
    the lane; the committed receipt is `receipt.json` next to this note, and its transcripts are
    `run1.jsonl` / `run2.jsonl`.
