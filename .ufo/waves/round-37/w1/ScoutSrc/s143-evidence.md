# S143 source-opening evidence — ScoutSrc (tabi r37 w1)

Scope: sourced-claim row §2b.4, grounding C2's replace-ref mechanism (claim source S143, git-replace manual).
Fetched with `curl -sSL` (curl --version line: curl 8.x via system package; no upgrade needed). Scratch copies
under /fast/scratch/hyaku/tabi-r37/w1/ScoutSrc/tmp/ (deleted at seat exit per trap).

## Fetch A — https://git-scm.com/docs/git-replace

- HTTP status: 200 (curl `-w "HTTP %{http_code}"` → `HTTP 200`; final_url == requested URL, no redirect)
- Byte size (body): 38,351 bytes (`stat -c %s`, == curl size_download=38351)
- sha256(body): 46750b9f957b96a0660e158438dec14105a955801b02f7c3a009cf47b88d9105
- UTC access timestamp: 2026-10-27T13:35:05Z (`date -u`; server `date:` header Tue, 27 Oct 2026 13:34:54 GMT)
- content-type: text/html; charset=utf-8
- last-modified (server): Mon, 26 Oct 2026 14:52:01 GMT; etag W/"6adf6911-95cf"; cf-cache-status: HIT; cf-ray a51214b86f5fbdb3-GIG
- Manual version banner on page: "git-replace last updated in 2.55.0" (raw line 1328)

Full response headers (verbatim):

```
HTTP/2 200
date: Tue, 27 Oct 2026 13:34:54 GMT
content-type: text/html; charset=utf-8
server: cloudflare
x-origin-cache: HIT
last-modified: Mon, 26 Oct 2026 14:52:01 GMT
access-control-allow-origin: *
etag: W/"6adf6911-95cf"
expires: Tue, 27 Oct 2026 13:36:22 GMT
cache-control: max-age=14400
x-proxy-cache: MISS
x-github-request-id: 7904:286ADF:9D784:B04CC:6AE0A67E
x-github-edge-region: brazilsouth
age: 511
via: 1.1 varnish
x-served-by: cache-gig2250036-GIG
x-cache: MISS
x-cache-hits: 0
x-timer: S1793107583.918006,VS0,VE142
vary: Accept-Encoding
x-fastly-request-id: 2a33c167017ee87313abd96396e996e0b0ee49d5
cf-cache-status: HIT
cf-ray: a51214b86f5fbdb3-GIG
```

### Quote A1 (target sentence) — VERBATIM PRESENT

Rendered text (tags stripped from raw lines 1708–1709), exact-match grep count = 1:

> The GIT_NO_REPLACE_OBJECTS environment variable can be set to achieve the same effect as the --no-replace-objects option.

- 17 words (≤25). Raw HTML spans two lines; tokens `GIT_NO_REPLACE_OBJECTS` and `--no-replace-objects`
  carry `<span class='synopsis'><code>…</code></span>` markup — plain-string grep over raw HTML misses it,
  rendered-text grep confirms it.

Raw context (git-replace.html lines 1680–1710, verbatim):

```html
<p>Replacement references will be used by default by all Git commands
except those doing reachability traversal (prune, pack transfer and
fsck).</p>
...
<p>It is possible to disable the use of replacement references for any
command using the <span class='synopsis'><code>--no-replace-objects</code></span> option just after <em>git</em>.</p>
...
<pre>$ git --no-replace-objects cat-file commit foo</pre>
...
<pre>$ git cat-file commit foo</pre>
...
<p>shows information about commit <em>bar</em>.</p>
...
<p>The <span class='synopsis'><code>GIT_NO_REPLACE_OBJECTS</code></span> environment variable can be set to
achieve the same effect as the <span class='synopsis'><code>--no-replace-objects</code></span> option.</p>
```

### Quote A2 (second located quote — replace refs overwrite object reads), 21 words ≤25

Located at raw lines 1680–1682:

> Replacement references will be used by default by all Git commands except those doing reachability traversal (prune, pack transfer and fsck).

Companion cat-file example (raw lines 1689–1705) demonstrating the overwrite on reads:

> `$ git --no-replace-objects cat-file commit foo` shows information about commit foo, while: `$ git cat-file commit foo` shows information about commit bar.

## Fetch B — https://git-scm.com/docs/gitrepository-layout

- HTTP status: 200 (curl `-w` → `HTTP 200`; no redirect)
- Byte size (body): 64,401 bytes (== size_download=64401)
- sha256(body): 2f736f8d40834d2fb4556322c44ae2ae332287df5b4eddcc0a8e5fdd78da82b5
- UTC access timestamp: 2026-10-27T13:35:05Z (server `date:` Tue, 27 Oct 2026 13:34:54 GMT)
- last-modified (server): Mon, 26 Oct 2026 14:52:03 GMT; etag W/"6adf6913-fb91"; cf-ray a51214b93992d868-GIG

### Quote B1 (supporting — refs/replace directory description)

Raw `grep -n "refs/replace"` → line 2127 (`<dt …>refs/replace/<obj-sha1></dt>`); the `<dd>` description follows:

> records the SHA-1 of the object that replaces <obj-sha1>.

- 10 words (≤25). Full `<dd>` block (4 sentences) also located, raw lines 2127–2134:

```html
<dt class="hdlist1" id="Documentation/gitrepository-layout.txt-refsreplaceobj-sha1" ...>
refs/replace/<span class='synopsis'><em>&lt;obj-sha1&gt;</em></span> </dt>
<dd>
<p>records the SHA-1 of the object that replaces <span class='synopsis'><em>&lt;obj-sha1&gt;</em></span>.
This is similar to info/grafts and is internally used and
maintained by <a href='/docs/git-replace'>git-replace[1]</a>. Such refs can be exchanged
between repositories while grafts are not.</p>
</dd>
```

The exchangeability sentence ("Such refs can be exchanged between repositories while grafts are not.")
corroborates the c2r37-J1 threat model: a replace-graft forged in a clone rides through transport.

## Freshness / coverage notes

- Both pages served 200 from the live git-scm.com (Cloudflare HIT, GitHub Pages origin), current as of
  2026-10-27T13:35Z; `last-modified` is 2026-10-26, i.e. content fresher than the round-36 closure (2026-10-27 ~09:49 -03:00).
- No tool install/upgrade was required (curl present). No pacman used (guard honored).
- All writes confined to seat dir + scratch root; lane repo untouched outside seat dir.
