<!-- corpus entry — tabi-shokunin round 6 (2026-10-14), lane B6-1 (plan: plans/round-6.plan.md §Branch L; fixture seat = round-5 design §4 "external-class fixture v2", seat TABI-R5-4, unlanded by round 5 because the stop rule gated it — plans/round-5-record-draft.md:236). Method: a lane-authored loopback fixture (two ThreadingHTTPServer origins on 127.0.0.1:19541/19543; a CDP journey runner on 19542 driving headless chromium 152.0.7977.82) whose redirect chain and rate/ToS-shaped endpoints are instruments; 10 driver runs (2 cold chain runs byte-compared, 5 stop-cell runs, 2 headers-arm A/B runs, 1 retained misfire); a stop-and-report predicate fires on the first robots-disallow / 429 / 403 / interstitial-shape and is proved by the runner's own cell plan plus the fixture server's request log. Write scope: this file only — LOG entry (AGENTS.md:3), coverage row, SKILL distillation and commit are the integrating round's. Anti-claim: no external site contacted; every fixture byte is lane-authored (no mirrored real-site artifact, U7 default-deny holds); scratch /tmp/w6-tabi-b61/ (volatile — archive debt §9). Every hash below is provisional until the archive keeps pace (cdp-evidence-patterns.md:92). -->

# External-class fixture v2 — redirect chain + rate/ToS-shaped instruments (loopback only)

Scope: PROVINCE.md:9-13 (CDP session discipline; dynamic-page evidence patterns;
interaction-record discipline). Refusals honored (PROVINCE.md:15-19): no external
site loaded or interacted with — loopback only, twice over (both origins are
127.0.0.1, two ports); no secrets read; no session material present (fresh
chromium profile per run; no Cookie header fields recorded); no consequential
action; nothing was posted, filled or submitted anywhere.

Admission bar: corpus/QUALITY.md:1-8. Claims below are observations with anchors
(path:line, command, sha), inference marked `[inference …]`, or §9 unknowns.
Evidence produced 2026-10-14 on this host; every pin re-derived from disk at
write time. Related notes: `network-evidence-rung.md` §11 is the fixture v1
bytes this one extends (and the source of the 302-hop idea);
`interaction-approval-table.md` C6 is the class this fixture must **not** be
mistaken for; `cdp-evidence-patterns.md` §5 is the envelope this note feeds.

## 0. Step 0 read — the answer channel, polled once (no answer; Branch L holds)

The round-6 gate is mechanical and recorded before any act (round-6 plan §Step 0):
read `.ufo/l0-questions.md` whole, compare against the round-5 filing line.

| reading | value |
|---|---|
| `sha256sum .ufo/l0-questions.md` | `02c53ec60acfda4889e0cd57eb08e8f1bd5583708fcb8399bfc5a5593713613f` |
| `wc -l` / `wc -c` | 25 lines / 21,539 B |
| `grep -n 'tabi' .ufo/l0-questions.md` | exactly one hit, `:25` — the round-5 **filing line** (names `corpus/handoffs/operator-approval-request.md` + its sha256) |
| `head -c 20653 .ufo/l0-questions.md \| sha256sum` | `0a86973bd17c37f7fa454cde82aad0d8b41cbdcca37de2315b7a563a149de6f3` = the round-5 record's pre-append prefix value (`plans/round-5-record-draft.md:311-315`) |

Reading: the file is byte-identical to the round-5 post-append state — no answer,
no denial, no scope-less reply. **Branch L** (loopback depth) executes; the packet
stays filed and is **not re-asked** (ask-count 1; silence is not a denial).
Consequence for §8 below: U1 (real third-party rate/ToS surface) remains an
absence, and this note is written so it cannot be read as filling it.

## 1. What v2 is — and what it is not

v2 extends the rung §11 fixture into the classes R1 (a granted third-party
read-only run) would meet but loopback cannot honestly simulate:

- **E1 — the redirect chain.** 302 → 303 → 307, a cross-path hop
  (`/chain/hop1` → `/deep/path/hop2`), and a hop that changes origin within
  loopback (`127.0.0.1:19541` → `127.0.0.1:19543`); plus a second, all-same-origin
  chain of the same shape, added as the controlled counterpart so one factor —
  the origin hop — is isolated. Deliverable: **which layer reports what** (§4).
- **E2 — rate/ToS-shaped responses as instruments.** a robots-shaped body, a
  `429` + `Retry-After`, a `403`, and a CAPTCHA-shaped interstitial. Deliverable:
  the **stop-and-report predicate** — what gets recorded, and where the run stops
  (§2, §5) — never a policy claim.

It is **not**: a rate-limit measurement, a robots-semantics study, a ToS reading,
or evidence about any real surface (§8). It is an instrument, and its readings
are instrument readings.

## 2. The stop-and-report predicate (the E2 deliverable, mechanical)

Semantics, as executed — five rules, each falsifiable:

1. **First request is the conventional permission probe** `/robots.txt`. Parse its
   `Disallow:` prefixes; if the *intended next cell's* path matches a prefix →
   **STOP before issuing it**: record, and never issue it, never retry through.
2. During a run, the first response with status ∈ {429, 403} → **STOP**; record
   status, `Retry-After` **presence/value as a shape only** (never acted on as a
   schedule — the runner does not sleep, does not wait, does not re-request), the
   `Content-Type`, and the body bytes + sha.
3. The first response whose **body shape** matches the interstitial predicate
   (marker set; here `[data-tabi-gate="interstitial"]` + `document.title`) →
   **STOP, regardless of status** — measured because the fixture's interstitial
   is a **200** (§5, R4).
4. After a trip: write the trip record, close the session, and prove the stop —
   the runner's own cell plan marks every later cell `executed:false`, and the
   fixture server's request log must contain **no** request line for the skipped
   cell's path.
5. Every run closes per run (kill by PID from the process table, ports closed,
   `curl` exit 7) — §6.

Predicate source as executed (`v2-journey.mjs` sha256
`ccc3d83703e61cfbcf3811cc35e412138d663fe3378c287de720788678f6de79`, 21,062 B —
excerpt verbatim, lines 254-291 and 315-333 of that file):

```js
// ---- the stop-and-report predicate (mechanical; recorded per cell) ----
const STATUS_TRIP = [429, 403];
function robotsDisallowMatches(text, path) {
  const lines = text.split('\n').map((l) => l.trim()).filter((l) => /^Disallow:/i.test(l));
  const prefixes = lines.map((l) => l.slice(l.indexOf(':') + 1).trim()).filter((p) => p !== '');
  const hit = prefixes.find((p) => path.startsWith(p)) || null;
  return { prefixes, hit };
}
const INTERSTITIAL_MARKER = '[data-tabi-gate="interstitial"]';

let trip = null;
function tripRec(cell, cls, matchedOn, observed, action) {
  trip = { cell, class: cls, matchedOn, observed, action, atUTC: new Date().toISOString(), atRelMs: rel() };
  console.log(`TRIP [${cls}] cell=${cell} matchedOn=${matchedOn} -> STOP`);
  return trip;
}

async function attachTripBody(pathEnd) {           // CDP read — not a request
  await fetchBodies();
  const rid = [...requestOrder].reverse().find((id) => {
    const r = byId.get(id);
    const req = r.events.find((e) => e.kind === 'req');
    return req && req.url.endsWith(pathEnd);
  });
  if (rid && trip) {
    trip.observed.responseBody = byId.get(rid).body;
    trip.issuedRequestsAtTrip = requestOrder.length;
  }
}

const cells = [];
async function cellStep(name, fn) {
  if (trip) { cells.push({ cell: name, executed: false, skippedBecause: `stopped at ${trip.cell}` }); return null; }
  const r = await fn();
  cells.push({ cell: name, executed: true, result: r });
  return r;
}

// cell 0 — the conventional permission probe
const robots = await cellStep('robots-probe', readRobots);
const NEXT_CELL_PATH = { chain: '/m/307', 'probe-robots': '/private/instrument/probe',
  'probe-429': '/rate/429', 'probe-403': '/rate/403', 'probe-captcha': '/gate/interstitial' };
const intendedPath = NEXT_CELL_PATH[mode];
const m = robotsDisallowMatches(robots.text, intendedPath);
if (m.hit) {
  tripRec('robots-probe', 'robots-disallow', `Disallow ${m.hit} matches intended ${intendedPath}`,
    { robotsStatus: robots.status, sha256: robots.sha256, matchedPrefix: m.hit },
    'STOP — intended request NOT issued; never retry through');
  await attachTripBody('/robots.txt');
}
```

The trip record is a JSON document per run (`trip.json`) with fields
`{mode, cell, class, matchedOn, observed{status, retryAfter, ct, bodyBytes,
bodySha, responseBody}, action, atUTC, atRelMs, issuedRequestsAtTrip,
notExecuted[]}` — the shape a granted real run would file, exercised here on
fixture data only.

## 3. Fixture v2 — the bytes (embedded; these survive `/tmp`)

Served from two site dirs; `server.py` (below) serves both. Byte counts are exact
file sizes; **no file ends with a trailing newline** — a Markdown extraction that
adds one must strip it before hashing (rung §11 note applies verbatim).

`site-a/index.html` (476 B, sha256 `098fc8931b90f4102640e508fd7ff53884b6cec4322dac591e686505395780e1`):

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>TABI-R6-1 index</title>
<link rel="stylesheet" href="style.css">
</head>
<body>
<div id="frame">
<h1>TABI external-class fixture v2</h1>
<p id="static">step 1 — index. loopback only; instrument cells are fetch/navigation driven by the runner.</p>
<p><a id="chain-link" href="/chain/start">start the redirect chain</a></p>
<p><a id="gate-link" href="/gate/interstitial">gate</a></p>
</div>
</body>
</html>
```

`site-a/style.css` (234 B, sha256 `3bbb453e09fe8f6394c486bbf09098c6e5e1ceb5347867bdc640ee7ec1e5a9e3`; lane-authored continuation of the rung §11 stylesheet — first two rules identical, rung-specific rules dropped):

```css
html, body { margin: 0; padding: 0; background: #ffffff; color: #111111; font: 16px/1.5 monospace; }
#frame { width: 800px; height: 600px; box-sizing: border-box; padding: 24px; }
#static { background: #eef2ff; }
a { color: #0033cc; }
```

`site-a/robots.txt` (44 B, sha256 `bc0300dfa93d9486fea9d4ea93260644afab622842447230eec5b18632960df4` — a robots-**shaped** document, an instrument, §8):

```
User-agent: *
Disallow: /private/instrument/
```

`site-a/gate/interstitial.html` (775 B, sha256 `918b1f6d36ca7a74d4eb745b4b832b90dce53250863d0e23bd7ce121487dced2` — CAPTCHA-interstitial-**shaped**, served as **200**; all text lane-authored):

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Security check</title>
<style>
html, body { margin: 0; padding: 0; background: #ffffff; color: #111111; font: 16px/1.5 monospace; }
#frame { width: 800px; height: 600px; box-sizing: border-box; padding: 24px; }
#gate-note { background: #fff4cc; }
</style>
</head>
<body>
<div id="frame" data-tabi-gate="interstitial">
<h1>Security check</h1>
<p id="gate-note">Unusual traffic from this network. Complete the check to continue.</p>
<form id="challenge-form" action="/gate/verify" method="get">
<label>type <b id="challenge-word">tabi-loopback</b> <input id="challenge-input" name="c" type="text" value=""></label>
<button id="challenge-submit" type="submit">continue</button>
</form>
</div>
</body>
</html>
```

`site-a/private/instrument/probe` (95 B, sha256 `2450928fcdae59a8c7ea187101b95d2c6a60ce993c33f6285ea542094f777bc3`) — the path the robots cell *intends* and must never issue:

```
instrument-only path — the robots-disallow cell intends this request and must never issue it.
```

`site-a/chain/same-landed.html` (317 B, sha256 `a62625fb5ad17ca4ad9d23d130f9f733e428c828eb67e4f464ea3570fac4096a`) — same-origin chain terminus (links `../style.css`):

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>TABI-R6-1 same-origin landed</title>
<link rel="stylesheet" href="../style.css">
</head>
<body>
<div id="frame">
<h1>TABI-R6-1 same-origin landed</h1>
<p id="landed-note">final hop — same origin throughout (port 19541)</p>
</div>
</body>
</html>
```

`site-b/chain/landed.html` (308 B, sha256 `cee3607e086e9f14aca7aab1686b996cbf1371cadd7a656da53fe7f37b857c01`) — cross-origin chain terminus:

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>TABI-R6-1 landed</title>
<link rel="stylesheet" href="landed.css">
</head>
<body>
<div id="frame">
<h1>TABI-R6-1 landed</h1>
<p id="landed-note">final hop — origin changed within loopback (port 19541 to 19543)</p>
</div>
</body>
</html>
```

`site-b/chain/landed.css` (217 B, sha256 `4a8fff3006596f845e8b825c2961d62f1c2f28033dc5b2eda0b13f50af67a74d`):

```css
html, body { margin: 0; padding: 0; background: #ffffff; color: #111111; font: 16px/1.5 monospace; }
#frame { width: 800px; height: 600px; box-sizing: border-box; padding: 24px; }
#landed-note { background: #e6ffe6; }
```

`server.py` (3,884 B, sha256 `936f1584bf81decca8cd5e588032c6748ccec70a10ec5ae29c88690efa56b83a`; both origins run this file; usage `server.py <site-dir> <port> [hop-url]`):

```python
#!/usr/bin/env python3
"""TABI lane B6-1 fixture server v2 — loopback only, lane-authored bytes.

Routes: static files under <site-dir>; instrument endpoints below. Every
instrument response carries Cache-Control: no-store. /__ready is a quiet
readiness probe (204, never logged).

Usage: server.py <site-dir> <port> [hop-url]
  hop-url: absolute URL the origin-changing hop 307s to; absent -> same-origin
  /chain/landed.html.
"""
import json
import os
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = sys.argv[1]
PORT = int(sys.argv[2])
HOP = sys.argv[3] if len(sys.argv) > 3 else None


class Handler(SimpleHTTPRequestHandler):
    server_version = "tabi-fixture-v2/0.1"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def log_message(self, fmt, *args):
        if getattr(self, "_quiet", False):
            return
        sys.stderr.write("%s - - [%s] %s\n" % (self.client_address[0], self.log_date_time_string(), fmt % args))

    def _send(self, code, body="", ctype="text/plain; charset=utf-8", headers=()):
        b = body.encode("utf-8")
        self.send_response(code)
        for k, v in headers:
            self.send_header(k, v)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(b)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(b)

    def _redirect(self, code, location):
        self.send_response(code)
        self.send_header("Location", location)
        self.send_header("Content-Length", "0")
        self.send_header("Cache-Control", "no-store")
        self.end_headers()

    def do_GET(self):
        path = self.path.split("?", 1)[0]
        if path == "/__ready":
            self._quiet = True
            self.send_response(204)
            self.send_header("Content-Length", "0")
            self.end_headers()
            return
        if path == "/chain/start":
            return self._redirect(302, "/chain/hop1")
        if path == "/chain/same-start":
            return self._redirect(302, "/chain/same-hop1")
        if path == "/chain/same-hop1":
            return self._redirect(303, "/chain/same-hop2")
        if path == "/chain/same-hop2":
            return self._redirect(307, "/chain/same-landed.html")
        if path == "/chain/hop1":
            return self._redirect(303, "/deep/path/hop2")
        if path == "/deep/path/hop2":
            return self._redirect(307, HOP or "/chain/landed.html")
        if path == "/rate/429":
            return self._send(429, "rate-shaped 429 instrument (lane-authored). Retry-After is a shape, not a schedule.\n", headers=(("Retry-After", "7"),))
        if path == "/rate/403":
            return self._send(403, "toS-shaped 403 instrument (lane-authored).\n")
        if path == "/gate/interstitial":
            with open(os.path.join(ROOT, "gate", "interstitial.html"), "rb") as f:
                return self._send(200, f.read().decode("utf-8"), ctype="text/html; charset=utf-8")
        if path == "/m/307":
            return self._redirect(307, "/m/echo")
        if path == "/m/echo":
            return self._send(200, json.dumps({"method": self.command, "path": path}) + "\n")
        return super().do_GET()

    def do_POST(self):
        length = int(self.headers.get("Content-Length") or 0)
        body = self.rfile.read(length) if length else b""
        path = self.path.split("?", 1)[0]
        if path == "/m/307":
            return self._redirect(307, "/m/echo")
        if path == "/m/echo":
            return self._send(200, json.dumps({"method": self.command, "bodyBytes": len(body)}) + "\n")
        return self._send(405, "instrument endpoints only\n")


if __name__ == "__main__":
    ThreadingHTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
```

Runner provenance: `v2-journey.mjs` (21,062 B, sha `ccc3d837…`, above),
`v2-driver.sh` (5,736 B, sha `ebdf950a5c6a9f1b6015809e587cf559ec7bb137e9d968f07db273aee6f3c4bd`),
`compare-v2.mjs` (2,134 B, sha `ddd839de8264c459a0101d866bfbe82bf145e04bb0bcf3d9dbdec0b79c3875bc`),
`extract.mjs` — all `/tmp`-staged (§9 archive debt). Launch: `chromium 152.0.7977.82`,
fresh profile per run, `--headless=new --remote-debugging-port=19542
--remote-debugging-address=127.0.0.1 --disable-gpu --disable-background-networking`;
viewport pinned 800×600 (measured `innerWidth/innerHeight 800/600`, DPR 1).

## 4. E1 measured — the redirect chain across three layers

One chromium session, one cold run (`chain-run2`, 17:49:32–17:49:35Z; `chain-run3`,
17:49:35–17:49:38Z, is its byte-compare twin — §6), captured
per step (screenshot + DOMSnapshot + URL/history + CDP Network slice). The chain
lives in **one CDP requestId** whose later `requestWillBeSent` events carry
`redirectResponse` — i.e. hops are events, not separate request entries.

| hop | wire (own server log) | CDP `…redirectResponse.status` | CDP wire status line | client-visible |
|---|---|---|---|---|
| 1 | `A GET /chain/start` → 302, `Location: /chain/hop1` | *(first hop: null)* | `HTTP/1.0 302 Found` | — |
| 2 | `A GET /chain/hop1` → 303, `Location: /deep/path/hop2` (cross-path) | 302 | `HTTP/1.0 303 See Other` | — |
| 3 | `A GET /deep/path/hop2` → 307, `Location: http://127.0.0.1:19543/chain/landed.html` (origin hop) | 303 | `HTTP/1.0 307 Temporary Redirect` | — |
| 4 | `B GET /chain/landed.html` → 200 (308 B, sha `cee3607e086e9f14…`) | 307 | `HTTP/1.0 200 OK` | final 200, `location.href` = `…19543/chain/landed.html` |

Layer readings (all from the same run):

- **Wire** — the two server logs together list every leg with its status (A:
  `302 Found`, `303 See Other`, `307 Temporary Redirect`; B: `200 OK`); log pins
  `chain-run2/http-a.log` sha `16234c230b7d5835…` (1,006 B), `http-b.log` sha
  `adc597cc4d265ab6…` (294 B).
- **CDP** — hop statuses are recoverable twice (hop event + `responseReceivedExtraInfo`
  status line); the client-facing `Network.responseReceived` for the chain
  requestId reports **200** — intermediate statuses never reach that surface.
- **Client** — `PerformanceNavigationTiming.redirectCount` = **0** for the
  cross-origin chain, **3** for the all-same-origin chain of identical shape
  (302→303→307, same run, `same-origin-chain` cell; final
  `…19541/chain/same-landed.html`). The origin hop is the only factor that
  differs. `[inference, strong: the spec zeroes redirectCount for cross-origin
  navigations; the measurement here is the 0-vs-3 pair, mechanism unexamined —
  §9 U1]`
- **307 method/body preservation** (separate cell, same run): client fetch
  `POST /m/307` → `redirected: true`, `finalUrl = /m/echo`, response
  `{"method": "POST", "bodyBytes": 8}\n` (35 B, sha `5e4aed62a546f696…`); the wire
  shows `POST /m/307 → 307` then `POST /m/echo → 200` — method and 8-byte body
  survived the hop at both surfaces.

## 5. E2 measured — the four trip classes (stop proved, not asserted)

Seven stop-cell runs in the pinned revision — the five table rows below plus the
two A/B arms — one cold profile each, 17:49:15–17:49:52Z; every run starts
with the permission probe and the first trip stops it.

| run | class | matched on | observed at trip | issued at trip | cells not executed | stop proof (server log) |
|---|---|---|---|---|---|---|
| `probe-robots` | robots-disallow | `Disallow /private/instrument/` matches intended `/private/instrument/probe` | robots 200, 44 B, sha `bc0300df…` | 4 | `intended-target`, `followup-429` | `grep -c -F '/private/instrument/probe'` → **0** |
| `probe-429` (+ `probe-429b` rerun) | http-429 | status 429 | 429, `Retry-After: 7`, ct `text/plain; charset=utf-8`, body 84 B sha `48321a1e12becaeb…` | 5 | `followup-interstitial` | `grep -c '/gate/interstitial'` → **0** |
| `probe-403` | http-403 | status 403 | 403, no `Retry-After`, body 43 B sha `538e4a35d396805f…` | 5 | `followup-interstitial` | `grep -c '/gate/interstitial'` → **0** |
| `probe-captcha` | interstitial-shape | marker `[data-tabi-gate="interstitial"]` **at status 200** | 200, title `Security check`, body 775 B sha `918b1f6d36ca7a74…` | 5 | `followup-429` | `grep -c '/rate/429'` → **0** |
| `chain-run1` *(retained misfire)* | robots-disallow | *(runner rev-1 bound the intended path to the robots cell in every mode)* | robots 200, 44 B | 4 | `post-307`, `chain-navigate`, `post-429-probe` | log = 5 lines; no `/m/307`, no `/chain/start`, no `/rate/429` |

Notes that carry weight:

- **R5 A/B, retained** (same fixture and cell, one factor — whether the *page*
  consumes the body before CDP is asked for it):

  | arm | runs | client-side read | CDP `Network.getResponseBody` | client body sha |
  |---|---|---|---|---|
  | A (headers only) | `probe-429h`, `probe-403h` | `x.status` / `x.headers.get(...)` | `-32000 "No data found for resource with given identifier"` — **2/2** | not read |
  | B (body consumed) | `probe-429`, `probe-429b`, `probe-403` | `x.text()` then sha in node | 200 with body — **3/3**, sha equals the client sha (`48321a1e…`, `538e4a35…`) | `48321a1e…`, `538e4a35…` |

  Both arms stop at the same cell with the same `notExecuted` proof; the only
  difference is the read path. The driver's mode-specific stop grep covers
  `probe-429`/`probe-403`/`probe-captcha`/`probe-robots`; the two A/B arms'
  proofs were re-derived by direct grep on their `http-a.log` (both **0**).
- The **identical-cell rerun** (`probe-429` vs `probe-429b`, separate cold
  profiles) produced **identical trip records** apart from `atUTC`/`atRelMs`
  (mechanical check: JSON compare after deleting the two timestamp fields →
  `true`), including the same 84-byte body sha. Same-cell determinism holds for
  the trip record, not just for pixels.
- `chain-run1` is a **kept calibration** (QUALITY.md:5): the first runner revision
  hardcoded the intended path, so the chain run tripped at the permission probe.
  It is retained because it is a clean stop instance (nothing after robots was
  issued) and because it shows the predicate is *not* advisory — a mis-bound rule
  halts the run. The fix bound `intended` to the next cell's path per mode; the
  chain pair was re-run afterwards (§6).
- The 429 body's `Retry-After`-bearing bytes are recorded but never acted on: the
  runner stops; it does not wait 7 s, does not re-request, does not retry through.

## 6. Determinism + closure (the guards)

- **Byte-identity.** `chain-run2` vs `chain-run3` (independent cold profiles,
  fresh servers, sequential runs): `compare-v2.mjs` → **13 rows, 13 IDENTICAL,
  0 DIFFER** — `step-1-index` (PNG 21,427 B / 800×600, sha `b0528cebff431d7a…`,
  shape `87e1477e49a40b91…`, struct `7e4f1c2591f4fca6…`), `post-307` (byte-identical
  to `step-1-index` — the header-only POST cell does not repaint),
  `step-2-landed` (13,385 B, `ea09f60ce2686c75…`), `step-3-same-landed`
  (13,497 B, `c76931d59e4256dd…`). Compare table: `/tmp/w6-tabi-b61/compare-chain.tsv`.
- **Closure, per run (10/10 — the 9 non-misfire runs + the retained misfire).**
  Each driver killed chromium by PID from the process
  table (`pgrep -f -- user-data-dir=$OUT/profile`; `pgrep` never matches itself —
  the round-1/round-4 self-match class cdp-evidence-patterns.md:105 is avoided),
  then verified: no chromium process for the profile, ports 19541/19543/19542 not
  listening, `curl` exit 7 to both the CDP endpoint and the fixture origin(s).
  Closure lines are in each run's `closure.txt` (e.g. `probe-429/closure.txt`).
- **Fresh profile per run**, no cookies/state carried; recorded `Cookie` header
  fields = 0 on every wire request in the runs (`cookieHeaderFields` in
  `journey.json`).
- **Egress, logged:** `grep -Eic 'google|gcm|accounts' chromium.log` → **0** in
  all 10 runs under `--disable-background-networking`. This narrows round 2's
  recorded GCM-attempt observation (`live-dynamic-capture.md` §6) but is a
  browser-log reading only — no packet-level audit was performed (§9 U6).

## 7. Rules delta — what v2 adds to the envelope (each with its falsifier)

- **R1 — the wire carries the chain; the client carries only the end.** Server
  logs list every leg; CDP recovers each hop twice; the client surfaces
  (`fetch` result, `PerformanceNavigationTiming`) expose only the final response.
  *Falsifier:* a run where the client reports an intermediate hop status.
- **R2 — `redirectCount` is a same-origin-only witness.** 3 for the 3-hop
  same-origin chain, 0 for the same shape with an origin change at the last hop.
  *Falsifier:* a cross-origin chain whose `redirectCount` equals its hop count.
- **R3 — 307 preserves method and body end-to-end.** `POST /m/307` → `POST /m/echo`
  at the wire; echo reports `"method": "POST"`, `bodyBytes 8`; client sees
  `redirected: true`. *Falsifier:* a 307 leg whose method degrades to GET.
- **R4 — a status-only stop rule cannot see an interstitial.** The fixture's
  interstitial is a **200**; the trip fires only on a body-shape marker.
  *Falsifier:* a 200-status response that trips a status-only predicate.
- **R5 — read the body through the page when you also need CDP's copy.** Retained
  A/B, one factor (§5): with a headers-only client read, `Network.getResponseBody`
  returned `-32000 "No data found for resource with given identifier"` — **2/2**
  (`probe-429h`, `probe-403h`); with the body consumed (`response.text()`), the
  same CDP read succeeded **3/3** (`probe-429`, `probe-429b`, `probe-403`) with the
  CDP sha equal to the client-computed sha (`48321a1e…` for 429, `538e4a35…` for
  403). *Falsifier:* a run where the −32000/success split tracks something other
  than client consumption. `[mechanism unexamined — §9 U2]`
- **R6 — a stop is provable from the fixture side.** The skipped cell's path never
  appears in the server request log (5/5 table runs + the 2 A/B arms + the
  misfire; §5). *Falsifier:* a stopped run with a request line for the skipped cell.
- **R7 — the fixture is byte-stable across cold runs.** 13/13 IDENTICAL on the
  chain pair, including both landed pages. *Falsifier:* any DIFFER row in
  `compare-chain.tsv`.

## 8. Discipline written here so it cannot be misread (the 429 rule)

**A loopback 429 is an instrument, never a C6 datum.** This fixture's
`robots.txt`, `429`, `403`, and interstitial are **lane-authored shapes** served
by a lane-authored loopback server. They are evidence about *this fixture* and
about the stop-and-report mechanics — nothing else. Specifically:

- No real site's rate limit, ToS, robots policy, or countermeasure is measured,
  inferred, or implied here. C6's deciding evidence remains an **absence**
  (`interaction-approval-table.md:62, :191-192` — U1 stays open);
- The `Retry-After: 7` value is authored by the lane and is **never acted on** as
  a schedule — it is recorded as a shape (presence + value) and the run stops;
- Nothing here widens the approval table: no grant, no budget, no site. A real
  run still requires a read-back that names site + scope (+ budget for a rate
  surface) from `.ufo/l0-questions.md` — which, per §0, does not exist.

## 9. Archive debt, unknowns, handoffs

**Archive debt.** Everything live is `/tmp/w6-tabi-b61/`: the fixture site dirs,
`server.py`, `v2-journey.mjs`, `v2-driver.sh`, `compare-v2.mjs`, `extract.mjs`,
and 10 run dirs (each: `journey.json`, `trip.json` where tripped, `closure.txt`,
`driver.log`, `http-a.log` ± `http-b.log`, `chromium.log`, PNG/DOMSnapshot/shape
captures). The *fixture* bytes survive `/tmp` because they are embedded in §3; the
*run artifacts and the runner scripts* are staged only — the archive seat must copy
them into `corpus/evidence/` with a `MANIFEST.txt` (cdp-evidence-patterns.md:92);
every hash in this note is provisional until then.

**Unknowns (do not convert to claims without a new probe).**

- **U1.** Whether `redirectCount = 0` on a cross-origin chain generalizes — one
  fixture, one origin change, 2 runs; the mechanism (spec-level zeroing) is
  `[inference]` only.
- **U2.** Why `Network.getResponseBody` answered `-32000` pre-consumption and
  succeeded post-consumption — timing, buffer admission/eviction, or
  consumption state; not isolated (a plain sleep was never tried).
- **U3.** Why the second `/style.css` load (same run, after the origin hop)
  carried CDP's `requestServedFromCache` event with `fromDiskCache:false` /
  `fromMemoryCache:false` and no wire event in its slice — the rung's D7 class,
  resurfaced by this fixture; **not** examined here (L1's matrix territory).
- **U4.** Interstitials in the wild are not marker-shaped; the predicate's shape
  test is fixture-specific by construction, and no generalization beyond "status
  alone is insufficient" is claimed.
- **U5.** Real robots semantics (wildcards, per-agent groups, `Crawl-delay`) are
  not exercised — the fixture's robots is a 2-line document; the parse rule here
  is a prefix match on `Disallow:` lines only.
- **U6.** Egress: the browser *log* shows 0 GCM/Google lines in 8/8 runs with
  `--disable-background-networking`, but no packet-level observation was made —
  "loopback fixture" still does not prove "no egress" (cdp-evidence-patterns.md
  :36 E4).

**Handoffs (named, not absorbed).**

- **E3 third-party-JS-shaped async** (late settle, beacon-shaped POST, canceled
  404) — part of the round-5 fixture design §4 but **not in this seat's named
  scope** (the assignment names the redirect chain, 429/`Retry-After`, robots and
  CAPTCHA shapes). It stays unlanded and is carried to the round-6/7 record.
- The **L1 mechanism matrix** (wire-class/cache-revalidation for repeated
  same-URL subresources) is a separate seat's; this note supplies the fixture and
  the stop predicate only. U3 above is one of its seeds.

## 10. Errata (append-only — never edit above blocks)

*(none yet)*