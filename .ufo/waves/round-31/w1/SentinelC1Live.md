# SentinelC1Live — C1 first falsifier: the `--live` fetch path

**Seat** SentinelC1Live · **Milestone** C1 · **Wave** w1 · **Round** 31 attempt 1
**Baseline** `96a2d1a3e04a1d482a1bd8bfa97343bcc2acf3bc` · **Measured/freeze rev** `9505a10eb80b2a0b273ebaba3f7f872ad302192d`
**Counter under attack** `scripts/check-decision-table.mjs` (sha256 `d15f3bd7aef4423d4311c2402f2d01bac8c7ff140a2fdd448ad2500f482f6832` = `claims.json.frozenDigests`)
**Verdict word** holds on protocol/redirect hygiene; **defect** on evidence provenance.

---

## Verdict

The fetch path's *transport* rules hold exactly as the counter's header claims and as the ticket asks:
`curl -q` is argv[0] and demonstrably neutralises both `$HOME/.curlrc` and `$CURL_HOME`;
`--proto =https` refuses `http://` and `file://` input (exit 1) and `--proto-redir =https` refuses an
https→http redirect (exit 1, "Protocol http is disabled (in redirect)") while the control without that flag
follows the downgrade (exit 0); a 30 s-blackhole peer stops at `--max-time` (exit 28); a missing `curl`
binary yields `null` → `l1-live`, exit 1, no crash; the url reaches curl as a discrete argv element behind
`^https:\/\/\S+$`, so there is no shell or option injection; and the same-host guard is correct on
host:port (same host+port redirect admitted, host change rejected, port-only change rejected, `URL.host`
carries a non-default port) including against a **backslash-authority** `Location`
(`https://localhost:18443\@127.0.0.2:18443/attacker`, which Node reads as host `localhost:18443`), because
curl reports `%{url_effective}` in its *resolved* form. What does **not** hold is provenance: the live
oracle's only provenance argument is "TLS to that hostname verified against *whatever trust store the
environment names*", and `spawnSync("curl", …)` additionally resolves the binary through `PATH`, so
`HTTPS_PROXY` + `SSL_CERT_FILE` (or a `curl` earlier in `PATH`) makes `--live` admit a row for the real
S121 URL with **zero packets reaching GitHub** — demonstrated end-to-end against the frozen counter
(exit 0, `admitted: 1`). Two smaller holes: any **200 page that merely echoes the quote** (soft-404 / error
page) satisfies `l1-live`, and the receipt's url need only be a **substring** of the registry row's source
cell, so the document fetched need not be the document cited. Nothing was repaired (attack seat).

---

## What I attacked (function by function)

| Target | Lines (at `9505a10e`) | Question |
|---|---|---|
| `curlFetch` | 194–199 | can the argv, env or binary change what is fetched? |
| `hostOf` | 204–206 | is the host:port comparison exact across Node/curl parser differences (userinfo, IDN, backslash, default port)? |
| `liveOk` | 208–215 | can a 200 that is not the cited document pass? is a failed fetch distinguished from an absent quote? |
| `loadReceipt` g2 | 251 | which URL is actually fetched, and is it the cited one? |

```js
194 function curlFetch(url) {
195   const r = spawnSync("curl", ["-q", "-sS", "--proto", "=https", "--proto-redir", "=https", "-L", "--max-redirs", "5", "--max-time", "60",
196     "-o", "-", "-w", "\n%{http_code} %{url_effective}", url], { encoding: "buffer", maxBuffer: 64 * 1024 * 1024 });
197   if (r.status !== 0) return null;
...
204 function hostOf(url) {
205   try { return new URL(url).host.toLowerCase(); } catch { return null; }
206 }
...
208 function liveOk(url, quote, fetcher) {
209   if (!/^https:\/\//.test(url)) return false;
210   const res = fetcher(url);
211   if (!res || res.code !== 200) return false;
212   if (!/^https:\/\//.test(res.effective) || hostOf(res.effective) !== hostOf(url)) return false;
213   return normalise(res.body).includes(quote);
214 }
251   else if (typeof rc.url !== "string" || !/^https:\/\/\S+$/.test(rc.url) || !rows.get(id).source.includes(rc.url)) res.reason = "g2-url";
```

Method: every offline check of the counter was satisfied in a scratch fixture repo (`$HYAKU_SCRATCH/tabi-r31/SentinelC1Live/fx1…fx11`,
each a real two-commit git repo of its own), so that **the `--live` fetch was the only mutable condition**.
Loopback HTTPS servers, a loopback CONNECT MITM proxy and a fake `curl` supplied the adversarial
endpoints; a locally generated CA (`ca`) and a cert with SANs `IP:127.0.0.1, IP:127.0.0.2, DNS:localhost,
DNS:docs.github.com, DNS:xn--bcher-kva.example` supplied the trust anchors. `frozenDigests` verified;
`--selftest` at the freeze rev: **34/34, exit 0** (`selftest.txt`). All counter runs used
`--repo <fixture>`; the same two arms reproduce from a clean `git clone --shared` of the freeze rev
(`clone`, `HEAD 950a10e`, `git status --porcelain` empty, counter sha256 identical).

---

## Finding 1 — DEFECT (Low–Medium): the live oracle's provenance is ambient (proxy, trust store, PATH)

*Exploit path.* `spawnSync("curl", …)` inherits `process.env` and resolves `curl` through `PATH` (line 195).
`-q` disables `.curlrc` only; it does **not** disable `HTTPS_PROXY`/`https_proxy`/`ALL_PROXY`,
`SSL_CERT_FILE`/`SSL_CERT_DIR`/`CURL_CA_BUNDLE`, or `PATH`. `%{url_effective}` reports the *requested*
URL, not the peer that answered, so the same-host guard at line 212 is satisfied by construction when a
proxy terminates TLS. Anyone (or any stale CI/profile setting) that names a proxy and a CA makes the live
reading attest the proxy's bytes.

| Arm | Fixture / URL | env | exit | reading |
|---|---|---|---|---|
| A3 | `fx3`, real `https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api` | `HTTPS_PROXY=http://127.0.0.1:18445 SSL_CERT_FILE=ca/ca.pem` | **0** | **admitted 1**, failing 0 — bytes from a loopback MITM page, `CONNECT docs.github.com:443` answered locally |
| A3b | same | `HTTPS_PROXY` only | 1 | `l1-live` (proxy MITM rejected by ordinary TLS verification → the *trust store* is the decisive knob) |
| A1 | `fx1`, `https://localhost:18443/ok` | `SSL_CERT_FILE` only | **0** | admitted 1 |
| A2 | same | clean env | 1 | `l1-live` |
| A4 | `fx3` | clean env, real GET | 1 | `l1-live` (the oracle does bite when the environment is clean) |
| A5 | `fx3` | `PATH=<scratch>/fakebin:$PATH` | **0** | admitted 1; the fake's log records the exact argv: `-q -sS --proto =https --proto-redir =https -L --max-redirs 5 --max-time 60 -o - -w %{http_code} %{url_effective} <url>` |

The A3 response body is literally `We could not find that page … Your query matched: <quote>` — a 200
soft-404 (`curl-semantics.txt`, last line). Nothing left the host: the proxy answered the CONNECT itself.

*Impact.* `l1-live` is a statement about the environment's network path and trust store, not about the
cited origin. In the lane's own threat model (the L1 runs the counter in a clean checkout) the privilege
required to set these variables is the same as editing the repo, so **this does not by itself falsify C1**;
it does mean the counter's `--live` reading cannot be quoted as "the cited host still says this" unless the
measurement env is scrubbed. A *non-adversarial* instance is realistic: a corporate MITM CA exported in
`SSL_CERT_FILE` plus an `HTTPS_PROXY` in the profile silently makes the reading attest the proxy's copy.

*Smallest remediation.* Pin the child, not just the flags: `spawnSync("curl", [... "--proxy", "", "--cacert",
"<fixed system bundle>", ...], { env: { PATH: "/usr/bin:/bin", … } })` (or resolve the binary once with
`which`/absolute path and pass an explicit `env`). `--proxy ""` also neutralises `ALL_PROXY`;
`--cacert` overrides `SSL_CERT_FILE`/`CURL_CA_BUNDLE`.

*Disclosure:* A4 was **one** read-only HTTPS GET of the S121 URL (permitted); an earlier control (`/redir-docs`)
caused curl to open a TLS connection to the real `docs.github.com` that failed hostname verification before
any HTTP request (exit 60) — no API call, no credentials, no login anywhere.

---

## Finding 2 — DEFECT (Low): a 200 error page that echoes the quote passes `l1-live`

`liveOk` line 213 is a quote-presence test over the normalised body; it never checks that the body *is* the
cited document. `fx2` serves a 200 HTML error page — `<title>Something went wrong</title> … <h1>We could not
find that page</h1><p>Your query matched: <quote></p>` — and the frozen counter admits it:

```
$ node scripts/check-decision-table.mjs --repo fx2 --rev <rev> --baseline <base> \
      --entry corpus/knowledge/fx-table.md --live --json        # SSL_CERT_FILE=ca/ca.pem
exit=0  {"live":true,"population":1,"admitted":1,"failing":0,"reasons":[null]}
```

Mechanism: a soft-404 handler or a search page that reflects a query string, a quoting blog post hosted on
the same host, or a docs site that renders the RFC text in a "related" panel all satisfy the oracle while the
cited page is gone. `normalise` also strips `<script>`/`<style>`, so a quote present only in a JSON payload
is invisible (the counter's own case `html-script-text-not-located` shows the mechanism), which is the
mirror-image false negative. *Impact:* `l1-live` cannot distinguish "the document still says it" from "the
host still serves the string somewhere". Report-only; no cheap fix (a canonical-URL or digest match would be
a different, stronger oracle).

**Authoring note for C1 (measured, not inferred):** the real S121 page fetched this round normalises to
15,503 characters of visible text that still carries the whole vocabulary — `requests per hour`,
`secondary rate limit`, `retry-after`, `x-ratelimit`, `5,000`, `403`, `429` all present after
`normalise` (`S121.text`, receipt `S121.receipt.json`: 200, 337,116 bytes,
sha256 `ae5e1812e43a380b5d33d91d42e07d225068fbe629ba84f55ccd13b9b6084c18`). Quotes taken from rendered text
survive; quotes taken from `__NEXT_DATA__` do not.

---

## Finding 3 — DEFECT (Low): the fetched URL need only be a *substring* of the cited source cell

Line 251 tests `rows.get(id).source.includes(rc.url)`; `liveOk` then fetches `g.url` — the **receipt's**
url, not the registry's. `fx5` declares the full page in `S900`'s source cell but uses `https://docs.github.com`
as the receipt url, and the offline reading admits:

```
$ node …check-decision-table.mjs --repo fx5 --rev <rev> --baseline <base> --entry corpus/knowledge/fx-table.md --json
exit=0  {"population":1,"admitted":1,"failing":0,"reasons":[null]}
```

*Impact:* with `--live`, the fetch (and therefore the attestation) can be a shorter/prefix URL — a site root,
a directory index, a redirector — while the row cites the document. *Remediation:* require that the receipt
url be an *equal* cell token of the registry source (or that the source cell contain it as a delimited URL,
not as an arbitrary substring).

---

## Finding 4 — INFORMATIONAL: two unparseable hosts compare equal

Line 212 compares `hostOf(res.effective) !== hostOf(url)`, and `hostOf` returns `null` on parse failure, so
`null !== null` is `false` and the same-host guard **passes vacuously**
(`hostmatrix.txt`: `https://a:b:c/x → null`, `https://%zz/x → null`, "null===null case evaluates to: true").
I could not turn this into a repro: curl rejects the same authorities Node rejects
(`https://a:b:c/x` → exit 3, "Port number was not a decimal number"), and both-null requires an
effective URL that curl fetched but Node cannot parse. Latent logic asymmetry, not an exploit today.
*Remediation:* `if (!a || !b || a !== b) return false;`.

---

## Finding 5 — INFORMATIONAL: every fetch failure reads `l1-live`

A dead link, a TLS failure, a refused proxy, `curl` absent (A6: exit 1, `l1-live`, no crash), a 403/429 from
the host, and "the quote is gone" are all reported as `l1-live` with no diagnostic detail (stderr from
`-sS` is discarded). This matters specifically here: the entry's subject is rate limiting, and an
*unauthenticated* measurement can be 403/429'd by the very mechanism the table documents. Bounds that do
hold: `--max-time 60` per transfer (exit 28 observed against a peer that accepts and never speaks, shortened
to 3 s for the test), `--max-redirs 5`, `maxBuffer` 64 MiB (a runaway body becomes a failed fetch, not a
crash). `spawnSync` has no timeout of its own and there is no `--connect-timeout` and no retry; worst case
is 60 s × distinct (url, quote) pairs, sequentially.

## Finding 6 — INFORMATIONAL (maintenance): `-q` must stay argv[0]

Verified both directions: with `HOME=<trapdir>` holding `user-agent = "FROM-CURLRC"`, plain `curl` sends
`FROM-CURLRC` (exit 0) and `curl -q` sends `curl/8.23.0` (exit 0); `CURL_HOME` with `-q` likewise has no
effect. curl documents `-q` as effective only as the first parameter, so any future reordering of the argv
re-introduces `.curlrc` (which can add `--output`, `--resolve`, `-k`, `--config`) silently.

---

## Holds — each with its control

| Property | Evidence (exit codes) |
|---|---|
| `--proto =https` refuses non-https input | `http://…` → exit 1 `Protocol "http" is disabled`; `file:///etc/hostname` → exit 1 |
| `--proto-redir =https` is load-bearing | https→http redirect → exit 1 `… (in redirect)`; **control** `--proto =https,http` without `--proto-redir` → exit 0, "plain http reached" |
| same host+port redirect admitted | `fx8` (`/redir-self` → `/ok`) exit 0, admitted 1 |
| cross-host redirect rejected **even though the body has the quote** | `fx7` (Location `https://localhost:18443\@127.0.0.2:18443/attacker`, body `SERVED-BY-127.0.0.2 <quote>`) → exit 1, `l1-live` |
| backslash-authority trick cannot bypass the guard | curl reports `%{http_code} %{url_effective}` = `200 https://127.0.0.2:18443/attacker`, i.e. the resolved target, which fails `hostOf` against `localhost:18443` |
| port-only change rejected (host:port, not host) | `fx9b` (`/redir-port` → `https://localhost:18447/ok`, 200, body has the quote, `%{url_effective}` = `https://localhost:18447/ok`) → exit 1, `l1-live`; `URL.host` keeps a non-default port and normalises 443/case (`hostmatrix.txt`) |
| IDN consistent | curl CONNECTs `xn--bcher-kva.example:443` while `%{url_effective}` keeps the UTF-8 form; `new URL()` maps both to punycode → equal; end-to-end `I1` exit 0, admitted 1 |
| userinfo consistent | `new URL("https://user:pw@docs.github.com/x").host` = `docs.github.com`, matching curl's connection target; `U1` (`https://u:p@localhost:18443/ok`) exit 0, admitted 1. Note: userinfo in a receipt url would be *sent* as Basic auth — no receipt carries credentials, the counter reads none. |
| no shell/option injection from a receipt url | url must satisfy `^https:\/\/\S+$` (line 251) before reaching curl; passed as a discrete argv element (A5 log shows it as one element) |
| missing `curl` fails closed | `A6` (PATH with node/git only) → exit 1, `l1-live`, empty stderr, no crash |
| timeout enforced | `--max-time 3` against 127.0.0.1:18446 (accepts, never speaks) → exit 28 after 3001 ms |

---

## Commands run (abridged; all exit codes as stated)

```sh
# freeze-rev clone and digest
git clone --shared …/tabi-shokunin "$S/clone" && git -C "$S/clone" checkout -q 950a10e…   # 0 / 0
sha256sum "$S/clone/scripts/check-decision-table.mjs"   # d15f3bd7…f6832  (= frozenDigests)
git -C "$S/clone" status --porcelain                    # empty
node "$S/clone/scripts/check-decision-table.mjs" --selftest   # exit 0, cases=34 passed=34

# counter arms (fixtures under $HYAKU_SCRATCH/tabi-r31/SentinelC1Live, TMPDIR there)
SSL_CERT_FILE=ca/ca.pem node …/check-decision-table.mjs --repo fx1 … --live --json   # 0  admitted 1
env -u SSL_CERT_FILE node …/check-decision-table.mjs --repo fx1 … --live --json      # 1  l1-live
HTTPS_PROXY=http://127.0.0.1:18445 SSL_CERT_FILE=ca/ca.pem node … --repo fx3 … --live --json  # 0  admitted 1 (real S121 URL, no egress)
HTTPS_PROXY=http://127.0.0.1:18445 node … --repo fx3 … --live --json                 # 1  l1-live
node … --repo fx3 … --live --json                                                    # 1  l1-live (direct GET)
env PATH=fakebin:$PATH node … --repo fx3 … --live --json                             # 0  admitted 1
env PATH=<node,git only> node … --repo fx3 … --live --json                            # 1  l1-live
# guard arms fx7 (1 l1-live) · fx8 (0 admitted 1) · fx9b (1 l1-live) · fx2 (0 admitted 1) · fx5 offline (0 admitted 1)
# curl semantics matrix: 13 rows, see curl-semantics.txt
```

Network fetches made this round (read-only HTTPS GET, no credentials, no API): one GET of
`https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api` at
`2026-10-26T08:46:05Z`, status 200, 337,116 bytes, sha256 `ae5e1812…084c18` (`S121.receipt.json`), and one
further GET of the same URL as arm A4 (verdict only, no receipt captured). Everything else was loopback.

## Not verified / out of scope

* No run against the lane's real `REV` entry (C1's table does not exist yet) — the predicate itself was not executed.
* Same-pattern exposure in `scripts/check-frontier-admission.mjs` was **not** examined (round-30 routed
  defect 3, `notClaimed`); Finding 1/6 will apply there verbatim if it uses the same argv.
* `SSL_CERT_DIR`, `CURL_CA_BUNDLE`, `ALL_PROXY`, `CURL_SSL_BACKEND` were not exercised individually — same
  class as the demonstrated `SSL_CERT_FILE`/`HTTPS_PROXY`/`PATH`, and only the demonstrated ones are claimed.
* The 60 s value itself was not waited out; the mechanism was verified at 3 s (`--max-time 3` → exit 28).

## Receipts in this directory

`arms.json` (all arms) · `arm-A1|A2|A3|A3b|A4|A5|A6|P1|U1|I1.json` (raw counter JSON) · `fx1…fx11`, `fx9b`
fixture descriptors (base/rev) · `curl-semantics.txt` · `hostmatrix.txt` · `S121.receipt.json` + `S121.text`
(normalised) · `proxy-connect.log` · `selftest.txt` · `repro-servers.mjs`, `repro-build-fixture.mjs`,
`repro-harness.mjs`, `repro-fakebin-curl.sh`, `cert-sans.txt` (full reproduction; the test CA, fixture repos
and scratch clone were deleted with the scratch tree).

**Tooling:** none installed or upgraded (`curl 8.23.0`, `node 24.21.0`/`26.12.0`, `openssl 3.6.5` already present).
