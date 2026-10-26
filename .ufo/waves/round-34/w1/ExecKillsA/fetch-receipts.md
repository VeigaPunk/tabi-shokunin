# C2 build (seat A) — read-only fetch receipts

All fetches: `curl -q -sS --proto =https`, no credentials, no cookies, public source pages only.
SHA-256 is over the bytes as received (gitiles `?format=TEXT` bodies are base64; the decoded
sha256 is given for those). A 404 is recorded by its body text, not its sha.

| # | URL | UTC time | HTTP | bytes | sha256 / body |
|---|---|---|---|---|---|
| F1 | `https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/chrome/test/chromedriver/util.cc?format=TEXT` | 2026-10-26T19:52:22Z | 503 | 1459 | an HTML error page (`<!DOCTYPE html>…`), no source bytes |
| F2 | `https://raw.githubusercontent.com/chromium/chromium/154.0.8037.97/chrome/test/chromedriver/util.cc` | 2026-10-26T19:52:26Z | 200 | 19648 | `3ed654c7574c1dd977b79aa22960432e07ff502593fc66d170aa6fae213be37b` — **byte-identical to S127's recorded decoded blob sha256** |
| F3 | `…/154.0.8037.97/chrome/test/chromedriver/bidi_commands.cc` | 2026-10-26T19:52:37Z | 404 | 14 | `404: Not Found` |
| F4 | `…/154.0.8037.97/chrome/browser/bidi/bidi_browser_session.cc` | 2026-10-26T19:52:37Z | 404 | 14 | `404: Not Found` |
| F5 | `…/154.0.8037.97/chrome/browser/bidi/bidi_mapper.cc` | 2026-10-26T19:52:37Z | 404 | 14 | `404: Not Found` |
| F6 | `…/154.0.8037.97/components/bidi/bidi_mapper.cc` | 2026-10-26T19:52:55Z | 404 | 14 | `404: Not Found` |
| F7 | `…/154.0.8037.97/chrome/browser/bidi/bidi_browser_session_impl.cc` | 2026-10-26T19:52:55Z | 404 | 14 | `404: Not Found` |
| F8 | `https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/chrome/test/chromedriver?format=JSON` (directory listing) | 2026-10-26T19:52:55Z | 200 | 12687 | listing of `chrome/test/chromedriver/` at the tag; contains `embed_bidimapper_in_cpp.py`, `window_commands.cc`, `util.cc`, no `bidi_commands.cc` |
| F9 | `…/154.0.8037.97/chrome/test/chromedriver/embed_bidimapper_in_cpp.py?format=TEXT` | 2026-10-26T19:53:40Z | 200 | 1860 | base64 body sha256 `5fb798ca3526066aaae2857cffccfa76aa3841eee758a678507bbabacbc63f02`; decoded sha256 `2f77bc5b6e1111941a69ec9ac5d4b9b2dea812cb355102002cec139c4fed8158`; it embeds a prebuilt mapper JS (`WriteSource('bidimapper', …)`), so the mapper's own id minting is not in this tree |

## What the fetches establish

- **F2** re-establishes S127's fact this round: `util.cc:39-43`

  ```cpp
  std::string GenerateId() {
    uint64_t msb = base::RandUint64();
    uint64_t lsb = base::RandUint64();
    return base::StringPrintf("%016" PRIx64 "%016" PRIx64, msb, lsb);
  }
  ```

  i.e. 32 lower-case hex — the shape the M06 case refuses when it is upper-cased.

- **The browsing-context shape (32 upper-case hex) has no registry row yet.** It rests on the
  committed round-32 evidence (`corpus/evidence/round-32/bidi/run1/transcript.jsonl`,
  `"context":"31B8FE9C25C36020CBB175F250715903"`) and the lane's own knowledge note
  (`corpus/knowledge/bidi-runtime-gate-v2-round-33.md:91`, `:227`). F3-F7 were probes for a public
  statement of that shape at the 154 tag and all 404'd; F9 shows the mapper ships prebuilt, so its
  id minting is not reachable from the chromium tree by a plain path.
  **An S130+ registry row for this shape is still needed** — `corpus/SOURCES.md` holds 129 rows at
  the freeze and lane files are outside this seat's write scope.
