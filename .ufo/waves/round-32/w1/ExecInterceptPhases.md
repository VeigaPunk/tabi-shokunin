# C1 depth probe — BiDi `network.addIntercept` phases × interception commands (matrix R13)

**Verdict.** On this host (chromium 154.0.8037.97 + chromedriver 154.0.8037.97, BiDi via `webSocketUrl`), all three
intercept phases are reachable and each blocked request arrives with `isBlocked: true` carrying the intercept id:
`beforeRequestSent` and `responseStarted` against the counter's `serveFixture()`, `authRequired` against a same-origin
loopback 401 (the frozen fixture serves no 401 path, so auth was measured on a supplementary 127.0.0.1 origin — stated,
not hidden). Command validity is phase-gated exactly as W3C WD-20261008 §7.5.5 prescribes: `continueRequest` only at
`beforeRequestSent`, `continueResponse` at `responseStarted`/`authRequired` (rejected at `beforeRequestSent`),
`provideResponse` at all three, `failRequest` except `authRequired`, `continueWithAuth` only at `authRequired`. R13's
recipe (hold + `continueRequest`) reproduces the lane's CDP `Fetch.enable`/`Fetch.requestPaused`/`Fetch.continueRequest`
hold 1:1, with two operational constraints measured here: **the intercept is inert unless the session is currently
subscribed to at least one network event**, and **url patterns are literal/component matches, not globs** (`*` is
rejected as "Forbidden characters" per §7.5.4.19, so CDP's `*routes.json*` pattern has no string-form equivalent).
Two auth-phase results are implementation-specific and should be quoted as observed, not as spec-derived:
`continueWithAuth` with `action:"default"` leaves the fetch pending indefinitely in headless (no credential UI), and
`continueResponse`/`provideResponse` at `authRequired` resume as an empty-credential retry (`Authorization: Basic Og==`)
instead of substituting the supplied body.

## What was attacked

Matrix §2 row R13 ("Pre-settle hold"), runtime side: `network.addIntercept` phases `beforeRequestSent`,
`responseStarted`, `authRequired`, each crossed with `continueRequest`, `continueResponse`, `provideResponse`,
`failRequest` (plus `continueWithAuth` as the phase's own release), against chromium 154 BiDi over chromedriver.
Comparison target: the lane's CDP Fetch hold recipe at `corpus/knowledge/async-step-evidence.md:64-68`.

## Environment and provenance

| item | value |
|---|---|
| clone | `git clone --shared …/tabi-shokunin` at `/fast/scratch/hyaku/tabi-r32/ExecInterceptPhases/clone`, detached `4181fffb4e9e9ad7ba7b73d43d50faffd690d1e6` |
| counter bytes | `scripts/check-bidi-runtime.mjs` sha256 `2f25af5a3c6326b9295f7fb191c3b76334dbb23a3403d39755d9e9ee3516c393` (= `claims.json` frozenDigests) |
| `serveFixture()` | imported unchanged from the clone's counter; fixture sha (`FIXTURE_SHA256`) as pinned; page origin `http://127.0.0.1:<ephemeral>` |
| chromium | `Chromium 154.0.8037.97 Arch Linux`, `--headless=new`, throwaway `--user-data-dir` under scratch |
| chromedriver | `ChromeDriver 154.0.8037.97 (b510e9d7cd3a2fbd78d0ddc42234103206c5f78d-refs/branch-heads/8037@{#1673})` |
| node | `v24.21.0` (global `WebSocket`, independent BiDi client) |
| session | `browserName: chrome`, `browserVersion: 154.0.8037.97`, `webSocketUrl: ws://127.0.0.1:<port>/session/<id>` |
| navigation | 127.0.0.1 loopback only; no external site, no credentials, no cookie reuse across origins |

Spec source opened this round: `https://www.w3.org/TR/webdriver-bidi/` — GET 2026-10-26T16:02:37Z, HTTP 200,
4,235,856 bytes, sha256 `dc1077db50fe784435fd57f2fa7005607937b5ee4293f6f12d8731bd6a1d24d4` (identical bytes to the
2026-10-20 fetch recorded in `webdriver-bidi-capability-matrix.md`'s dated correction, so the WD text did not move);
anchors read: §7.5.3 (intercepts, `update the response`), §7.5.4.19 (`UrlPattern`, forbidden characters), §7.5.5.2
(`addIntercept`), §7.5.5.3 (`continueRequest`), §7.5.5.4 (`continueResponse`), §7.5.5.5 (`continueWithAuth`), §7.5.5.7
(`failRequest`), §7.5.5.9 (`provideResponse`).

## Phase → command → observed

Rows within a phase table share one BiDi session (auth rows: the same session, one fresh origin per row); each row =
add intercept → trigger → observed blocked event → one command. Raw frames in `frames.jsonl` and
`auth-frames.jsonl` (output dir). "fetch" column is what the page's `fetch()` promise finally saw.

### Phase `beforeRequestSent` (exact URL pattern; trigger `fetch('/data.txt?case=…')`)

| row | command | observed result |
|---|---|---|
| event | — | `network.beforeRequestSent` `isBlocked: true`, `intercepts: ["<id>"]`, `request.request: "605301.3"` (frames.jsonl seq 34) |
| R13 main | `continueRequest` | success `{}` → `responseStarted`/`responseCompleted` 200 unblocked; fetch `{"status":200,"text":"tabi-bidi-body-0123456789\n"}` (seq 35–42) |
| — | `continueResponse` | **error `invalid argument`**, `Blocked request for network id '605301.4' is in 'beforeRequestSent' phase`; released with `continueRequest` → original body |
| — | `provideResponse` | success `{}`; responseStarted/Completed 200; fetch `{"status":200,"text":"provided-brs"}` (supplied body wins) |
| — | `failRequest` | success `{}`; fetch `{"error":"TypeError: Failed to fetch"}`; `network.fetchError` `net::ERR_FAILED` |
| — | `continueWithAuth` | **error `invalid argument`**, same phase message (`'beforeRequestSent' phase`) |

### Phase `responseStarted` (trigger `fetch('/data.txt?case=…')`; `beforeRequestSent` arrives unblocked first)

| row | command | observed result |
|---|---|---|
| event | — | `network.responseStarted` `isBlocked: true`, `intercepts: ["<id>"]`, `response.status: 200`, `request.request: "605301.8"` (seq 105) |
| — | `continueResponse` | success `{}` → fetch original body; `responseCompleted` 200 |
| — | `continueRequest` | **error `invalid argument`**, `Blocked request for network id '605301.9' is in 'responseStarted' phase`; released with `continueResponse` → original body |
| — | `provideResponse` | success `{}`; fetch `{"status":200,"text":"provided-rs"}` |
| — | `failRequest` | success `{}`; fetch `TypeError: Failed to fetch`; `network.fetchError` `net::ERR_FAILED` |
| — | `continueWithAuth` | **error `invalid argument`**, phase message (`'responseStarted' phase`) |

### Phase `authRequired` (same-origin 401 `WWW-Authenticate: Basic realm=…`; one fresh loopback origin per row)

| row | command | observed result |
|---|---|---|
| event | — | `network.authRequired` `isBlocked: true`, `intercepts: ["<id>"]`, `response.status: -1`, `request.request: "167567.5"` (auth-frames.jsonl) |
| — | `continueWithAuth {action:"cancel"}` | success `{}`; `responseStarted` 401 → fetch `{"status":401,"text":"auth required tabi-cancel\n"}` |
| — | `continueWithAuth {action:"default"}` | success `{}`; fetch **still pending after 2.5 s** — headless has no credential UI, request stays held until the page navigates |
| — | `continueRequest` | **error `invalid argument`**, `Blocked request for network id '167567.11' is in 'authRequired' phase`; released with `continueWithAuth {action:"cancel"}` → 401 |
| — | `continueResponse {statusCode:200}` | success `{}`; blocked request resumed and the browser **retried with `Authorization: Basic Og==`**; server logged a second request and returned 200 `auth ok tabi-contResp Basic Og==` |
| — | `provideResponse {statusCode:200, body:"provided-ar"}` | success `{}`; same empty-credential retry — server saw `Authorization: Basic Og==`, fetch got the **server's** 200 `auth ok tabi-provide Basic Og==`; the supplied body was **not** delivered |
| — | `failRequest` | **error `invalid argument`**, `Request '167567.17' in 'authRequired' phase cannot be failed`; released with `continueWithAuth {action:"cancel"}` → 401 |

Auth-phase trigger coverage (fresh origin each): same-origin `fetch()` → event; `<img src>` subresource 401 → event with
`request.destination: "image"` and `goog:resourceType: "Image"`; top-level navigation → event with
`request.destination: "document"` and a non-null `navigation` field. A cross-origin `fetch()` (different port) does **not**
raise `authRequired`; it fails at CORS first (first attempt: `TypeError: Failed to fetch`, `net::ERR_FAILED`, no event) —
recorded as an artifact of that attempt, superseded by the same-origin design.

## Intercept acceptance and URL-pattern forms (all measured)

| shape | result |
|---|---|
| `phases:["beforeRequestSent"]`, `urlPatterns:[]` | success — matches all URLs |
| `phases:["beforeRequestSent","responseStarted","authRequired"]` | success — multiple phases in one intercept accepted |
| `phases:["responseCompleted"]` | error `invalid argument` — `Invalid enum value. Expected 'beforeRequestSent' \| 'responseStarted' \| 'authRequired', received 'responseCompleted'` |
| `phases:[]` | error `invalid argument` — `Array must contain at least 1 element(s) in "phases".` |
| string pattern `…/data.txt?held=1` (counter's exact shape) | success, exact-URL match incl. query (blocked event observed) |
| string pattern `…/data.txt*` or `*` or `…/never-*` | error `invalid argument` — `Forbidden characters` (spec §7.5.4.19 forbids `( ) * { }`; the string form is a literal URL, not a glob) |
| string pattern `/data.txt` | error `invalid argument` — `Failed to construct 'URL': Invalid URL '/data.txt'` (must be absolute) |
| structured `{type:"pattern", protocol, hostname, port, pathname}` | success **and matches** (blocked event observed) |
| structured `{type:"pattern", pathname:"/data.txt"}` | success, matches any host/port/query |
| structured `{type:"pattern", pathname:"/data.txt", search:"case=c4"}` | success, matches that query only |
| structured `{type:"pattern"}` (empty) | success, matches everything |
| structured `{type:"pattern", pathname:"/data*"}` | error `invalid argument` — `Forbidden characters` |
| second command on an already-released request | `continueRequest` success, then error `no such request` (`No blocked request found for network id '605301.19'`) |

## Ordering constraint: the intercept needs a live network subscription

Same session, same literal pattern, only the subscription state changed (`subscribe-dependence.json`,
`unsubscribe-dependence.json`, raw frames alongside):

| state at `addIntercept` | blocked event | fetch |
|---|---|---|
| never subscribed this session | none | completed immediately with the fixture body (intercept accepted but inert) |
| subscribed to `network.beforeRequestSent` | `isBlocked: true` | pending until `continueRequest`, then fixture body |
| subscribed, then `session.unsubscribe`d | none | completed immediately |
| re-subscribed | `isBlocked: true` | pending until release |

The counter's `liveRecord()` already subscribes before adding its R13 intercept, so its recipe is ordered correctly;
the constraint is a depth note for any future hold recipe in the lane.

## Comparison with the lane's CDP Fetch recipe

`async-step-evidence.md:64-68`: `Fetch.enable {urlPattern:'*routes.json*', requestStage:'Request'}` before navigation →
`Fetch.requestPaused` resolves the hold waiter → `Fetch.continueRequest` after the pre-capture → `Fetch.disable` at the
end. Mapping measured here:

- `requestStage:'Request'` ⇔ phase `beforeRequestSent`; the hold/release pair is the same two-step shape and the same
  witness (a blocked-event frame carrying a request id that the release command names). The counter's R13 predicate
  matches this exactly, and the `brs-continueRequest` row satisfies it end to end.
- `requestStage:'Response'` ⇔ `responseStarted`; BiDi has no phase beyond the three, so `network.addIntercept` cannot
  observe `responseCompleted` (rejected as an enum value), whereas CDP can hook completion through other domains.
- CDP selects by a glob (`*routes.json*`) inside one `Fetch.enable`; BiDi requires one intercept object per
  phases × pattern set, and the string pattern cannot glob — a component `pattern` object or a literal URL is the
  working form. The counter's literal `${base}/data.txt?held=1` is spec-correct.
- CDP exposes auth challenges as a separate `Fetch.authRequired` + `continueWithAuth`; BiDi folds it into the same
  intercept list as a third phase, which is why an `authRequired`-only intercept can be added while a `200` fixture
  request passes untouched (measured: no event, request complete).

## Evidence files (output dir `.ufo/waves/round-32/w1/ExecInterceptPhases/`)

| file | content |
|---|---|
| `probe-summary.json`, `frames.jsonl` | definitive beforeRequestSent/responseStarted matrix (10 cases), pattern/ordering extras, 244 wire frames, fixture base, versions — its 5 `ar-*` rows are the superseded cross-origin auth attempt (`fetchError`, no event) and are replaced by `auth-probe-summary.json` |
| `auth-probe-summary.json`, `auth-frames.jsonl` | authRequired matrix (6 cases on 6 fresh origins) + img/navigation triggers, 176 wire frames, per-origin server request logs |
| `pattern-forms.json`, `pattern-forms-frames.jsonl` | structured vs string patterns with the string-literal positive control |
| `subscribe-dependence.json`, `subscribe-dependence-frames.jsonl` | subscribe/unsubscribe ordering experiment |
| `unsubscribe-dependence.json`, `unsubscribe-frames.jsonl` | post-unsubscribe and re-subscribe variant |
| `pattern-probe.json` | first wildcard exploration (superseded by `pattern-forms.json`, retained) |
| `harness/` | the six node harnesses that produced the receipts + `SHA256SUMS.txt`. They import `serveFixture()` from the clone path at run time; to re-run, clone `4181fffb…` to that path first (scripts re-run with `TMPDIR` under scratch) |

## Commands run (and exit codes)

| # | command | exit |
|---|---|---|
| 1 | `git clone --shared …/tabi-shokunin "$S/clone" && git -C "$S/clone" checkout -q --detach 4181fffb…` ; `sha256sum scripts/check-bidi-runtime.mjs` | 0 (digest `2f25af5a…`) |
| 2 | `curl -q -sS --proto =https -o spec.html https://www.w3.org/TR/webdriver-bidi/` (2026-10-26T16:02:37Z, 200, 4,235,856 B, sha256 `dc1077db…`) | 0 |
| 3 | `TMPDIR=$S/tmp node probe2.mjs <out>` (fixture phases) | 0 (`cases 15, extras 7, frames 244`) |
| 4 | `TMPDIR=$S/tmp node probe5.mjs <out>` (authRequired, fresh origin per case) | 0 (`cases 6, extras 2, frames 176`) |
| 5 | `TMPDIR=$S/tmp node probe7.mjs <out>` (pattern forms + control) | 0 |
| 6 | `TMPDIR=$S/tmp node probe8.mjs <out>` (subscribe dependence) | 0 |
| 7 | `TMPDIR=$S/tmp node probe9.mjs <out>` (unsubscribe dependence, rerun with frames) | 0 |
| 8 | `pgrep -fa 'chromedriver\|chromium'` | only host `earlyoom … --prefer … chromium` (pid 1371, not mine); no chromedriver/chromium of this seat |

Superseded runs, kept honest: a first probe used `*` wildcards in every pattern (`Forbidden characters`, see
`pattern-probe.json`), and an earlier auth attempt fetched cross-origin (CORS `net::ERR_FAILED`, no event); both were
replaced by the runs above and their summaries overwritten. One run (`probe5`, first attempt) hit the 240 s timeout in
per-origin server teardown; re-run with `closeAllConnections()` before `server.close()` completed in 23 s. Two abandoned
tmp dirs from those aborted runs (`$S/tmp/pat-*`, `/run/user/1000/tabi-ar3-*`) were removed; scratch and the clone are
deleted after receipts were copied into the output dir.

## Risks and limits

- One host/build: chromium 154.0.8037.97 linux x64, chromedriver 154.0.8037.97. Nothing here speaks for other
  browser/binding versions; the matrix row's `locally measured` flip must stay version-scoped.
- `continueWithAuth default` hanging in headless is a UI-availability effect, not a claim about the command; a headed
  run could differ.
- The empty-credential retry after `continueResponse`/`provideResponse` at `authRequired` is recorded as wire behaviour
  (`Basic Og==`, second server request). The mechanism (browser auth retry vs. chromium-bidi default credentials) was
  not established.
- Chrome caches those empty credentials per origin: after one such resume, later 401s on the same origin may not raise
  `authRequired` at all (seen in an intermediate run where `provide`/`fail`/img/nav all got `200 auth ok … Basic Og==`).
  That is why the final auth rows use one fresh origin each; any R13-style auth recipe must do the same or use a fresh
  profile.
- Auth measurements are outside `serveFixture()` (which serves no 401): they use a supplementary loopback origin and are
  labelled as such in every summary's `origin` field.
