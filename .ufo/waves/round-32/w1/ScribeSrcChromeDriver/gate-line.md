# Round-32 lesson §Gate line — draft for S125 (seat ScribeSrcChromeDriver)

Convention copied from `corpus/lessons/kaika-fleet-round-1.md:42-56`
(`| row | seat | quote — location | sha256 (seat fetch) |`), which the SOURCES contract names as the
Gate format: each row's URL, access date, ≤25-word quote with location, and raw-fetch sha256.

## Recommended Gate line

```
| S125 | ScribeSrcChromeDriver | `caps.Set("webSocketUrl", "ws://" + session->host + "/session/" + session->id);` — session_commands.cc:288-289, inside `if (session->web_socket_url)` at 287 | `7b40e94cefe1b1d319cd054ff433470aad3944067f5a344b932e6ec068b7abb5` (decoded blob; raw `?format=TEXT` response `c5d66f5a2ad26997ff76da4b5d7e60fe30fbde4beb1d5d824cc7130c9074876e`) |
```

- URL: https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/chrome/test/chromedriver/session_commands.cc
- access date: 2026-10-26 (fetch `2026-10-26T16:06:48Z`, HTTP 200, 90944 B raw response)
- quote length: 12 whitespace-separated tokens (limit 25); verbatim, backticked so its own double quotes
  do not collide with the cell's quoting
- the enclosing conditional is named in the location, because the quote alone shows the return, not the flag

## Secondary locatable quote (same file, keep in `anchor`; usable as Gate quote instead)

```
`// Create a hidden target for running  BiDi-CDP mapper in it.` — session_commands.cc:407, inside the `if (session->web_socket_url)` block opened at 378
```

Note the **two spaces** between `running` and `BiDi-CDP` in the source; reproduce them or the quote is not
verbatim. 10 tokens.

## Verbatim check (both fragments, from the decoded blob)

```
$ sed -n '287,289p' session_commands.cc
  if (session->web_socket_url) {
    caps.Set("webSocketUrl",
             "ws://" + session->host + "/session/" + session->id);
$ sed -n '407p' session_commands.cc
    // Create a hidden target for running  BiDi-CDP mapper in it.
```

The quote in the Gate line joins the two physical lines 288-289 the way the compiler sees them; if the L1
prefers a strictly single-physical-line quote, use line 289 alone — `"ws://" + session->host + "/session/" + session->id` —
and keep "inside `if (session->web_socket_url)`, session_commands.cc:287" in the location.
