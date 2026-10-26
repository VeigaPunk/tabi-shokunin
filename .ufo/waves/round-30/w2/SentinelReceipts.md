# SentinelReceipts — round-30 w2 security audit of the committed C2 evidence

**Verdict: the four committed C2 receipts and their four byte blobs at `072af95fe2822f0785a6ff88a578e2142dd258e5` hold on every property my item names — https-only URLs whose host equals the row's source-cell host, no userinfo/credentials/query tokens, `http_status 200` in all four, `bytes_path` inside the repo, no cookies/session ids/auth tokens/PII in the committed bytes beyond the public documents themselves (one non-secret Cloudflare per-request token, Info), and sane sizes (S116 byte-identical to a fresh live GET; S117 the same 408,912 bytes as a fresh live GET). The asked-for confirmation is factual and I proved it four independent ways: for *these* receipts `--live` cannot read a local file — no `file://` string exists anywhere in the receipts or rows, `curl -L` refuses a `file:` redirect (“Protocol “file” is disabled (in redirect)”, exit 1), neither URL redirects at all (`num_redirects=0`), and under `unshare -Urn` with egress provably dead the frozen counter returns `population 2, admitted 0, failing 2, reasons l1-live S116, l1-live S117, exit 1` — so the live arm cannot be satisfied from committed bytes. The `file://` acceptance wave-1 proved (`scripts/check-frontier-admission.mjs:174`) is real but **latent here**: these two rows are safe because of their *data*, not their code, and a future receipt naming `file://…/bytes/S117.html` would reduce the anti-fabrication arm to comparing a file with itself (M1). Nothing was repaired.**

## Scope and method

- Item: audit the committed C2 evidence (receipts + bytes) at the round's integrated tip; confirm the local-read claim for these receipts; severity-ranked findings.
- Read-only on the lane. One `git clone --shared` at `/fast/scratch/hyaku/tabi-r30/SentinelReceipts/clone`, checked out at `072af95fe2822f0785a6ff88a578e2142dd258e5`, `git status --porcelain` empty. Scratch: `/fast/scratch/hyaku/tabi-r30/SentinelReceipts` (`HYAKU_SCRATCH=/fast/scratch/hyaku`). No lane file, index, jj state, fleet repo or sibling lane was written; no commits made; no subagents; no `agent://all`.
- **Tool installs: none** (no pacman — host transactions are paused — no uv/npx, no binaries). No builds/linters/formatters of the lane.
- Network: two read-only HTTPS GETs of the two cited public docs (allowed hosts), plus loopback only for the redirect probe. Every fetch recorded below (URL, UTC, status, bytes, sha256).
- Frozen counter bytes at the rev: `sha256(scripts/check-frontier-admission.mjs) = cadef57e8d9627a02d7e8c5404689225cf5b4de361e816f62c4127b28a509eca`, matching `claims.json.frozenDigests`. The evidence directory and the counter are byte-identical between `072af95` and the lane's current HEAD (`git diff --stat … -- corpus/evidence/round-30/frontier scripts/check-frontier-admission.mjs` → empty, exit 0).

## H · what held (each independently checked)

### H1 — https only, everywhere in the evidence

```
$ grep -nE 'file://|@|"(/[^"]*)"|\.\./' corpus/evidence/round-30/frontier/*.json \
      corpus/evidence/round-30/frontier/refetch/*.json
grep_exit=1                       # no match at all: no file://, no '@', no absolute path, no '..'
$ grep -n '"http://' …            # same four files
grep_exit=1
$ grep -n '"url"' …               # the only four url values
S116.json:3          "url": "https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-11.txt",
S117.json:3          "url": "https://docs.discord.com/developers/topics/rate-limits",
refetch/S116.json:3  "url": "https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-11.txt",
refetch/S117.json:3  "url": "https://docs.discord.com/developers/topics/rate-limits",
```

No query strings, no fragments, no userinfo, no port. Field sets are exactly `{id,url,fetched_at,fetched_by,http_status,bytes_path,sha256,quote}` and (refetch) `{id,url,seat,fetched_at,http_status,bytes_path,sha256,byte_count,quote,note}` — no stored request headers, no cookie jar, no response header block.

### H2 — host equals the row's source-cell host, and the entry cites the same host

```
$ awk -F'|' 'NR==130||NR==131 {print $2"|"$3}' corpus/SOURCES.md
 S116 | RateLimit header fields for HTTP — draft-ietf-httpapi-ratelimit-headers-11 — https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-11.txt
 S117 | Rate Limits — Discord Developer Documentation — https://docs.discord.com/developers/topics/rate-limits
$ awk 'NR==130||NR==131' corpus/SOURCES.md | grep -oE 'https?://[^ |]+' | sort -u
https://docs.discord.com/developers/topics/rate-limits
https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-11.txt
```
One URL per row, identical to the receipt URL (so `g2-url`'s substring test has no second host to hide in). The two entries' `source:` lines (`corpus/knowledge/rate-limit-policy-fields.md:3`, `corpus/knowledge/host-published-rate-limit-headers.md:3`) cite the same URLs and carry no other URL, no `@`, no query (grep exit 0, only those two URLs printed).

### H3 — `http_status 200`, and today's live GETs still return 200

Receipts/refetches: all four `"http_status": 200`. My own GETs:

```
2026-10-26T07:38:08Z GET https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-11.txt
   exit 0  "200 67097 0 https://www.ietf.org/archive/id/draft-ietf-httpapi-ratelimit-headers-11.txt"
   sha256 d6016dd0db5a33ba3f1e6b6f4c84e9b5ecc00986822d5212bab831f6c2d1d412   (= receipt sha256, byte-identical)
2026-10-26T07:38:09Z GET https://docs.discord.com/developers/topics/rate-limits
   exit 0  "200 408912 0 https://docs.discord.com/developers/topics/rate-limits"
   sha256 cd5f59c28defc3357ba2ac77b276a1fe916baac781376c95911a4aab0a86b133   (third distinct variant; see M4)
```
`%{num_redirects}` is 0 and `%{url_effective}` equals the receipt URL for both — there is **no redirect hop** on either row today, so the off-host-redirect vector wave-1 found (SentinelFetchScope F2/F12) is present in the code but unexercised by this data. Neither receipt records `url_effective`, which is why this had to be re-fetched to know.

### H4 — `bytes_path` stays inside the repo, and the blobs are the committed ones

All four `bytes_path` values are repo-relative (`corpus/evidence/round-30/frontier/bytes/S116.txt`, `…/S117.html`, `refetch/bytes/S116.txt`, `…/S117-refetch.html`), contain no `..` or leading `/` (H1 grep), and exist as regular `100644` blobs at the rev:

```
$ git ls-tree -r --long 072af95fe2822f0785a6ff88a578e2142dd258e5 -- corpus/evidence/round-30/frontier
100644 blob c9fd2892…   67097 bytes/S116.txt
100644 blob a2fcd188…  408912 bytes/S117.html
100644 blob c9fd2892…   67097 refetch/bytes/S116.txt        # same blob as the receipt's bytes
100644 blob 52f82d93…  408912 refetch/bytes/S117-refetch.html
```
`sha256sum` on the working-tree files matches all four recorded digests, exit 0:
`d6016dd0…d412` (S116.txt and refetch S116.txt), `b73dc7d1…83c3` (S117.html), `c1c2d3f9…b2f3` (S117-refetch.html). Note the refetch of the static IETF draft is the *same git blob* — an independent re-download that hashed identically, not a copied file (a copy would produce the same blob too, so this is corroboration, not proof of independence; the counter's seat check is a label check, as CritC2Counter F7 says).

### H5 — the committed bytes contain no cookies, session ids, auth tokens, or PII beyond the public docs

```
$ grep -ci 'set-cookie' bytes/S117.html refetch/bytes/S117-refetch.html
corpus/evidence/round-30/frontier/bytes/S117.html:0
corpus/evidence/round-30/frontier/refetch/bytes/S117-refetch.html:0
(grep exit 1 — zero matches)
$ grep -oiE 'set-cookie|csrf|xsrf|bearer|authorization|sessionid|session_id|_ga=|gid=|__cf|cf_clearance|nonce="[^"]*"' bytes/S117.html | sort | uniq -c
      4 authorization        # prose only, verified in context
      1 __CF                # __CF$cv$params, see M4
$ grep -oiE 'document\.cookie|localstorage|sessionstorage|indexeddb' bytes/S117.html | sort | uniq -c
     24 localStorage        # Next.js runtime references; no document.cookie anywhere
      1 LocalStorage
$ grep -oE '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}' bytes/S117.html | sort -u     # empty
$ grep -oE '\b([0-9]{1,3}\.){3}[0-9]{1,3}\b' bytes/S117.html | sort -u                    # empty
$ grep -oiE '"(buildId|traceId|requestId|deploymentId|vercelId)":"[^"]{0,40}"' bytes/S117.html   # empty
$ grep -oiE '(secret|api_key|apikey|access_token|auth_token|password|credential)["'"'"']?\s*[:=]\s*["'"'"'][^"'"'"']{4,40}' bytes/S117.html   # empty
```
The four `authorization` hits are documentation prose, not header values: *“If no authorization header is provided, then the limit is applied to the IP address…”* and *“…by providing a valid token in the authorization header when required…”*. No `Sign in`/`Log in`/account markers; the one `dashboard` hit is an analytics experiment name (`"dashboard-inbox"`) in a script. No HTTP header dump at the head of the file — it opens with `<!DOCTYPE html>`.

`bytes/S116.txt` does contain the draft authors' names and addresses (lines 1900 `Email: robipolli@gmail.com`, 1911 `Email: alex@flawedcode.org`, 1916 `Email: darrel@tavis.ca`) and a `mailto:httpapi@ietf.org` at line 32. That is IETF draft front matter in a published Standards-Track draft — public document content, not fetch metadata, and not a credentials/session leak. Informational only.

### H6 — sizes sane, documents complete, quotes at the intended anchor

```
67097  bytes/S116.txt                     67097  refetch/bytes/S116.txt
408912 bytes/S117.html                    408912 refetch/bytes/S117-refetch.html
```
S116 tails with `Polli, et al.  Expires 24 November 2026  [Page 35]` (complete 35-page draft); S117 tails with `…</script></body></html>` (complete page). The lesson's anchor claim checks out: `sed -n '308,311p' bytes/S116.txt` prints the quoted paragraph, ending `…differentiates it from the RateLimit (Section 4) field that contains information that MAY change`. Both quotes are exactly **25 words**, i.e. at `g4`'s upper bound with no margin (`norm-check.mjs`, exit 0: `quoteWords= 25` twice).

### H7 — for THESE receipts, `--live` cannot read local files (the asked-for confirmation)

Four independent legs:

**(a) Data leg — no `file://` anywhere.** `fetchLive`'s gate is `if (!/^(https:\/\/|file:\/\/)/.test(url)) return null;` (`scripts/check-frontier-admission.mjs:174`) and the `000`-status tolerance is conditioned on `url.startsWith("file://")` (`:180`). With `rc.url` https in all four records (H1), the `file://` branch is never selected and the `000` arm can never fire. The wave-1 hole is *data-gated off* here.

**(b) Transport leg — curl refuses a `file:` redirect.** Exact counter argv (`curl -sS -L --max-time 60 -o - -w '\n%{http_code}'`) against a loopback server that 302s to `file:///etc/hostname`:
```
$ curl -sS -L --max-time 60 -o - -w '\n%{http_code}' http://127.0.0.1:45799/redir-file
curl: (1) Protocol "file" is disabled (in redirect)
302curl_file_redir_exit=1
$ … http://127.0.0.1:45799/redir-http          # control: http→http hop is followed
BODY-OK
200curl_http_redir_exit=0
```
So even a hostile redirect cannot turn these https receipts into a local-file read (`curl 8.23.0`, default `--proto-redir` excludes `file`).

**(c) Redirect leg — there is no hop at all.** Both live GETs: `num_redirects=0`, `url_effective` == receipt URL (H3).

**(d) Decisive leg — with egress dead, the live arm fails for these receipts.** In a network namespace where curl cannot reach the network at all:
```
$ unshare -Urn curl -sS -o /dev/null -w 'code=%{http_code}\n' --max-time 10 https://www.ietf.org/archive/id/…
curl: (7) Failed to connect to www.ietf.org:443 after 0 ms: Could not connect to server
code=000 ; curl_exit=7
$ unshare -Urn node scripts/check-frontier-admission.mjs --rev 072af95fe… --frontier rate-tos-signal \
      --since 2026-10-26 --live --json
netns_counter_exit=1     population=2  admitted=0  failing=2  clean=false
  host-published-rate-limit-headers.md  ids [S117]  reasons ["l1-live S117"]
  rate-limit-policy-fields.md           ids [S116]  reasons ["l1-live S116"]
```
If the live check could be satisfied from the committed/local bytes for these rows, this run would have admitted them. It did not: `l1-live` on both. The same command with network returns `population 2, admitted 2, failing 0, clean true, exit 0` (my raw output is in `netns-live.json` and the online run's JSON below). **Confirmed: for these receipts, `--live` requires the wire and cannot read a local file.**

**(e) Syscall leg — nothing local is opened by the fetchers.** `strace -f -e trace=connect,openat` over the online live run (counter exit 0), all 22 `connect()` calls classified:

```
11  sa_family=AF_INET|AF_INET6, …:443   Cloudflare: 104.16.44.99, 104.16.45.99,
                                        162.159.128.233/135.232/136.232/137.232/138.232 (x2),
                                        2606:4700::6810:2c63, 2606:4700::6810:2d63 (x2)
 1  sa_family=AF_INET, sin_port=htons(53), 127.0.0.53        DNS to the local stub resolver
 4  sa_family=AF_UNIX, /run/systemd/resolve/io.systemd.Resolve   nss-resolve varlink (one completed, 3 unfinished)
 6  sa_family=AF_UNSPEC, sa_data="\0…"                        resolver family probes
```
No connect to any loopback or private-range **service** — the single loopback `connect` is UDP DNS to the stub resolver, and the only content sockets are the 11 TLS legs to public Cloudflare addresses. The two `curl` pids (identified by `libcurl.so.4` + `libssh2.so.1` in their open list) opened `~/.config/curlrc` and `~/.curlrc` (both `ENOENT`), `~/.ssh/known_hosts` (read), and **zero** paths mentioning `tabi-shokunin`. In the whole trace, openat of `corpus/` or `.ufo/` paths: **0**. All 61 write-mode opens in the whole trace were `"/dev/null"`; zero write-mode opens under `/home/vgpnk/Projects/shokunin/tabi-shokunin` (the trace does show the clone following `objects/info/alternates` into the lane's `.git/objects`, read-only — `git show` behaviour). Excerpt: `trace-excerpt.txt`.

## Findings, severity ranked

### M1 · Medium — the `file://` acceptance is a *data* guard, not a code guard; these rows are one edited JSON away from a vacuous live check

- Code: `scripts/check-frontier-admission.mjs:174` admits `^(https://|file://)`; `:180` accepts curl code `000` for `file://`; `:221-223` then treat the file's contents as “the live source”, and the self-test codifies it (`:341` `live-file-url-quote-gone`, `:342` `live-bytes-differ-from-committed`, both with `file://${d.root}/…`). `g2-url` (`:204`) is `row.source.includes(rc.url)`, so a `file://` receipt requires the row's source cell to carry the same string — both edits land in the same diff, which is wave-1's ameliorant and the only thing protecting a reader who trusts the verdict.
- Why it matters *here*: the exact reason S116/S117 are safe is that their `url` strings are https — not that the counter refuses local reads. A future receipt with `url: "file:///…/corpus/evidence/round-30/frontier/bytes/S117.html"` and committed bytes = the committed page would make `l1`/`l3` compare a file with itself, and the C2 predicate's anti-fabrication arm (`killRule`: “Measured with `--live`; the offline reading alone does not verify”) would be satisfied offline.
- Verdict: **latent defect, not realised in this data** (H7a-d). Severity Medium for the counter; None for these receipts.
- Smallest remediation (not applied): `:174` → `^https:\/\/` only, and gate the `000` arm at `:180` behind an `allowFile` option passed only by `--selftest`; then either migrate or explicitly internal-mark the two `file://` self-test cases. (Same remedy as SentinelFetchScope F1 / CritC2Counter F1; my contribution is the evidence that the two landed rows are protected by data alone.)

### M2 · Low-Medium — no post-redirect identity: scheme/host/count are unpinned and `url_effective` is not recorded on the receipt

- Code: `:175` `curl -sS -L --max-time 60 -o - -w "\n%{http_code}"` — no `--proto-redir`, no `--max-redirs`, no `%{url_effective}`; the final URL never reaches a receipt field and `l1`/`l3` certify whatever the chain lands on.
- Measured today: `num_redirects=0` for both rows, so nothing is wrong with these receipts; and curl's default `--proto-redir` excludes `file` (proved, H7b), so the local-read question is answered “no” even under a hostile hop. The residual exposure is remote (default set includes `ftp`/`ftps`, `https`).
- Verdict: **no defect in this evidence; hardening gap in the counter.** Remediation: `--proto-redir =https --max-redirs 3` and a required `url_effective` field compared against the row's host.

### M3 · Low — the live tie verifies 2.1 % of the S117 blob; the only part that varies between independent fetches is invisible to it

- `l1`/`l3` compare `normalise(bytes)`. For `bytes/S117.html`: 408,912 raw bytes → **8,728 normalised characters** (97.9 % of the blob is `<script>`/`<style>`/markup and is stripped). Measured (`norm-check.mjs`, exit 0): `cfTokenInRaw= true, cfTokenInNormalised= false`; `committedNorm==refetchNorm true`, `committedNorm==liveNorm true`.
- Consequence: the 400 KB of third-party JavaScript committed into `corpus/evidence/…/bytes/S117.html` is outside every gate check; the effective integrity guard for it is the receipt's `sha256` (which only binds the blob to itself) plus a reviewer's grep. Nothing malicious is in it now (H5), but “live bytes equal committed bytes” should not be read as “the committed blob equals the wire blob” for HTML rows — the normalisation makes the equality weaker the more script a page carries. (Related to CritC2Counter F2, quantified for this row.)
- Verdict: **holds today, with a stated limit.** Smaller remediation than changing `l3`: add a `wire_sha256` receipt field for HTML rows (or record both `raw_sha256` and `normalised_sha256`) so a reviewer can tell a re-expression from a fetch.

### M4 · Info — a per-request Cloudflare token is committed, and it is the *only* difference between the copies

- `bytes/S117.html` and `refetch/bytes/S117-refetch.html` are both 408,912 bytes and differ in **11 bytes**, all inside one inline script (the `__CF$cv$params` blob at the challenge-platform bootstrap):
```
<  window.__CF$cv$params={r:'a507779d197145a6',t:'MTc5Mjk5NjgwMg=='};…
>  window.__CF$cv$params={r:'a507785b992f772a',t:'MTc5Mjk5NjgzMg=='};…
$ node -e 'decode t'
MTc5Mjk5NjgwMg== -> 2026-10-26T06:40:02.000Z      # = S117.json fetched_at
MTc5Mjk5NjgzMg== -> 2026-10-26T06:40:32.000Z      # = refetch/S117.json fetched_at
```
  Non-secret (a bot-management ray id and a request timestamp; no ability to act, no account binding), and positively useful: the embedded timestamp independently corroborates each recorded `fetched_at` to the second. But it is per-request correlation data (usable against Cloudflare's logs) persisted in the repo forever, in two copies. Info; the cheap improvement is a sentence in the receipt `note` (“bytes retain the page's per-request `__CF$cv$params` token”) — deleting it would break the frozen digests.

### M5 · Info — the verdict is environment-dependent (dotfiles, PATH), though the environment was clean at audit time

- Trace shows curl probing `~/.config/curlrc` and `~/.curlrc` (both ENOENT) and reading `~/.ssh/known_hosts`; curl is resolved from `PATH` (`/usr/bin/curl`, root-owned, `curl 8.23.0`); no `HTTPS_PROXY`/`ALL_PROXY`/`NO_PROXY` in the environment. So this audit's live reading is hermetic in practice, but nothing in the counter pins it (`-q` absent, no `--no-netrc`, no absolute curl path). Same class as SentinelFetchScope F3; no action possible without unfreezing the counter.

### M6 · Info — a dangling duplicate commit carries byte-identical evidence

`git log --all -- corpus/evidence/round-30/frontier` lists `38891ca` (the round's C2 commit) and `be10893` — same timestamp, empty subject, **not** an ancestor of `072af95`. Every one of the eight evidence paths resolves to the *same blob id* in both commits (checked path by path, exit 0: `same … efd8efcb/ad3bc7ae/c9fd2892/a2fcd188/b0b25705/040ae9de/c9fd2892/52f82d93`). So there is no hidden alternative version of this evidence reachable through that object; it is an amend/stash residue, worth knowing only because a reviewer diffing “all branches” would see a phantom change.

## Negative findings (checks that could have failed and did not)

- No receipt field carries request headers, a cookie jar, an `Authorization` value, or a response body excerpt beyond the single quote.
- No `..`, absolute path, or symlink in `bytes_path`; the counter's own `blob()` guard (`:110`) would reject the first two anyway.
- No `http://` and no `file://` string anywhere in the four JSONs or the two rows/entries (grep exit 1); no `@` in any receipt URL.
- The refetch S116 bytes are the same git blob as the receipt's bytes (an identical re-download of a static `.txt`), and the refetch S117 bytes are a *different* blob whose normalised text is identical — exactly the shape the rule expects, not a copy-paste.
- The lesson Gate quotes match the receipt quotes verbatim (`corpus/lessons/round-30.md:15-16`), and the S116 anchor `-11 lines 308–311` is where the bytes actually put the paragraph.
- No writes by the counter or its children: 61 write-mode opens, all `/dev/null`; zero under the lane path.

## Note for C2's owners (not a defect of this evidence)

`.ufo/waves/round-30/measure/` holds `c1-before-at-freeze.json`, `c1-identity-blind-at-072af95.json`, `c1-identity-blind-harness.diff`, `c2-before-at-freeze.json` — **no `c2-*at-072af95` after-measurement**, which `claims.json.measurementRule` requires (“its raw output is committed under `.ufo/waves/round-30/measure/` before the report is written”). My runs here are *audit* readings, not that measurement, and must not be substituted for it; they do show the online `--live` reading at the tip:

```
$ node scripts/check-frontier-admission.mjs --rev 072af95fe… --frontier rate-tos-signal \
      --since 2026-10-26 --live --json          # exit 0
population 2  admitted 2  failing 0  clean true   (S117 via host-published-rate-limit-headers.md, S116 via rate-limit-policy-fields.md)
```

## Artifacts (in `.ufo/waves/round-30/w2/SentinelReceipts/`)

| file | what |
|---|---|
| `S116-live.txt`, `S117-live.html` | my 2026-10-26T07:38:08Z/09Z GETs (67097 B, 408912 B) |
| `live-fetch-sha256.txt` | their digests (`d6016dd0…d412`, `cd5f59c2…b133`) |
| `norm-check.mjs` | the normalisation/quote/CF-token probe (exit 0) |
| `netns-live.json`, `netns-live.err` | the egress-dead run: `admitted 0`, `l1-live ×2`, exit 1 |
| `redir.mjs` | the loopback redirect server used for the `file:`-hop refusal |
| `trace-excerpt.txt` | `connect`/curlrc/known_hosts lines from the strace'd live run |

## Commands and exit codes (all run at `072af95fe2822f0785a6ff88a578e2142dd258e5`)

```
sha256sum <4 committed byte files>                                   exit 0  (all four match receipt sha256)
wc -c <4 byte files>                                                 exit 0  67097/408912/67097/408912
git ls-tree -r --long <rev> -- corpus/evidence/round-30/frontier     exit 0
git diff --stat 072af95..HEAD -- …/frontier scripts/check-frontier…  exit 0  (empty: no drift)
git show <rev>:scripts/check-frontier-admission.mjs | sha256sum      exit 0  cadef57e…9eca
diff <(tr '>' '\n' <S117.html) <(tr '>' '\n' <refetch.html)          exit 0  one differing script line
cmp -l bytes/S117.html refetch/bytes/S117-refetch.html | wc -l       exit 0  11
grep -ci set-cookie <both S117 copies>                               exit 1  (counts 0 and 0 — no match)
grep -nE 'file://|@|"(/[^"]*)"|\.\./' <4 receipt JSONs>              exit 1  (no match — clean)
grep -n '"http://' <4 receipt JSONs>                                 exit 1  (no match)
node norm-check.mjs                                                  exit 0  normEqual true ×2, quoteWords 25 ×2, CF token stripped
node -e '<live vs committed normalised compare>'                     exit 0  true/true
curl live GET ×2 (S116, S117)                                        exit 0  200, 67097/408912, 0 redirects
strace -f … node … --live --json                                     exit 0  population 2 admitted 2 clean true
unshare -Urn curl … ietf draft                                      exit 7  Could not connect, code 000
unshare -Urn node … --live --json                                    exit 1  admitted 0, l1-live S116 + S117
curl -L loopback→file:// redirect                                    exit 1  Protocol "file" is disabled (in redirect)
curl -L loopback→http:// redirect (control)                          exit 0  body + 200
grep -cE 'O_WRONLY|O_RDWR|O_CREAT' trace-live.txt                    exit 0  61 (every one "/dev/null")
grep … trace-live.txt | grep -c tabi-shokunin                       exit 1  0 (no write-mode open in the lane)
grep -cE '"(…/)?(corpus|\.ufo)/' trace-live.txt                      exit 1  0 (no corpus/.ufo openat at all)
git log --all --format=… -- corpus/evidence/round-30/frontier        exit 0  38891ca + dangling be10893
git rev-parse be10893:<each evidence path> vs <rev>:<path>           exit 0  identical blob ids ×8
```

Checks I did not run are not claimed: no `--selftest` re-run of the counter (wave-1 has it at 24/24), no C1 surface, no instrumented probe of the counter's `ftp` redirect path (would need an off-host FTP hop, outside this item), and no attempt to reach any private/loopback target over https.
