VERDICT: PASS

# Recheck16 — C1 freshness recheck, rows S032 + S033

Lane tip at work time: `2bff864fdfee684ddbcd066cc8e735adaba2735c` (`git -C …/tabi-shokunin rev-parse --verify refs/heads/master`), i.e. baseline B. Producer
`.ufo/waves/round-18/recheck-fetch.mjs` sha256 `f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360` (recorded verbatim as `producerSha256` in both receipts).
Both rows are present in `corpus/SOURCES.md` at the tip and their `source`-cell URL occurs verbatim in the row (checked per row with awk over the pipe-delimited rows).

## S032 — WebMCP — Chrome for Developers (docs, tier A)

- Row: `corpus/SOURCES.md:46`; teaches *"Chrome documents WebMCP as an origin trial from Chrome 149 with a local chrome://flags testing switch, not a default-on feature"*.
- rowUrl (verbatim): `https://developer.chrome.com/docs/ai/webmcp`; fetch url: same.
- http **200**, bytes **145257**, full sha256 **22dec7bd5e3834c99921aa5776d1f05476036ec9647296480ae835b467df8067**, decode `html-text`.
- Quote (6 words, from the original Gate quote `corpus/lessons/round-16.md:42`):
  `Open Chrome and navigate to chrome://flags/#enable-webmcp-testing` — `quoteFound: true`, `quoteOffset: 7017`.
- Verdict: **held**. Anchor observed: **`Last updated: October 7, 2026`** (page footer, corroborated by JSON-LD `"dateModified": "2026-10-07"` in the same body) — matches the row's anchor cell `page last updated 2026-10-07`.
- Teaches check: the same excerpt shows `Join the WebMCP origin trial from Chrome 149.` (§Get started) followed by §Local WebMCP `WebMCP is available as a Chrome flag for local development:` → origin-trial framing + local flag, no default-on claim. Held at the anchor.
- Byte variance observed, disclosed: three curls of this page today saved 145257, 145261 and 26128 bytes (curl `size_download` 26121–26128 is the compressed transfer; `--compressed` writes the decompressed document). The receipt records the exact bytes the tool itself fetched and hashed (145257 / `22dec7bd…`); the quote is present in that body, so the variance does not affect the claim. [INFERENCE] the 4-byte spread is per-request page markup (nonce/timestamp), not content change — same plates, same `Last updated` date.

## S033 — Chromium 154 `model_context_supplement.idl` (code, tier A)

- Row: `corpus/SOURCES.md:47`; teaches *"The 154 build declares modelContext on Document, SecureContext, RuntimeEnabled=WebMCP; there is no Navigator partial"*.
- rowUrl (verbatim): `https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/renderer/core/script_tools/model_context_supplement.idl`
- fetch url: same + `?format=TEXT` (raw gitiles blob); decode `base64`.
- http **200**, bytes **520** (base64 body as served/wrapped), full sha256 **9c0d5822fbae41ec86cf407e8040d86ea3ace4d213d7845f2c436b72620cf373**.
- Decoded IDL body: 389 bytes, 12 lines, sha256 **50dd337d33c38403c60084fa8c716c9d8e2c01ff26405e331408c122ef906364** — identical to the pinned digest already in the row's anchor cell (`50dd337d…6364`), so the tag content is byte-identical to round 16.
- Quote (6 words, from the original Gate quote `corpus/lessons/round-16.md:43`):
  `[SecureContext, SameObject] readonly attribute ModelContext modelContext;` — `quoteFound: true`, `quoteOffset: 303`. It is line 11 of the decoded file, exactly as the row states.
- Verdict: **held**. Anchor observed: gitiles tag ref `refs/tags/154.0.8037.97` (URL-anchored tag; body digest pins the revision content — the row's commit `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d` was not re-resolved through gitiles metadata in this seat, only via the tag path + digest match).
- Teaches check: decoded lines 7–12 are one `partial interface Document` carrying `RuntimeEnabled=WebMCP, ImplementedAs=ModelContextSupplement` and the `[SecureContext, SameObject] … modelContext` attribute; the file contains no `Navigator` partial. Since the row's claim is scoped to this IDL/anchor ("no Navigator partial" in this file), held.

## Drift drafts
None — both rows `held`, so no superseding SOURCES row and no Gate entry was drafted.

## Checks run
- `node recheck-fetch.mjs --normalize-only` probes before each write: found=true for both quotes (`offset 7017`, `offset 303`).
- Post-write invariant check per receipt: schema `tabi-source-recheck-v1`; `quoteWords` == actual word count (6/6, 6/6); `normalize(quote)` occurs in the excerpt file; `excerptSha256` == sha256 of excerpt bytes; `sha256` 64-hex; `fetchedAt` 2026-10-20; `teachesVerdict` held. Result: all true for S032 and S033.
- No git/jj writes; no pacman or tool installs; no background jobs. Only the two receipt pairs and this report were written (`git status --porcelain` at the tip shows only the untracked round-18 dirs, no modifications to tracked files).

## Files written
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S032.json
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S032.excerpt.txt
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S033.json
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S033.excerpt.txt
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w1/Recheck16.md
