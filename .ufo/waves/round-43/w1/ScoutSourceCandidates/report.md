# ScoutSourceCandidates — frontier source candidates (round 43, w1)

Seat: ScoutSourceCandidates (leaf, no subagents dispatched)
Milestone: frontier source candidates — propose ≥3 concrete new SOURCES rows (NO registry writes)
Date: 2026-10-29
Report copies: this file (seat dir) and the item-named path
`.ufo/waves/round-43/w1/ScoutSourceCandidates.md` (identical bytes).

## Assignment

Evaluate by read-only opening: (1) the node:crypto `crypto.sign` API section (deeper quote
than S150's index line); (2) the MDN WebCrypto Ed25519 support page; (3) the git cat-file
`-s`/`--batch` documentation (batch-check for type+size in one call — C2 instrument
candidate); (4) a WebDriver BiDi network command reference. For each: URL, surface covered,
a ≤25-word flat quote actually located in the fetched bytes, tier proposal. Evidence copies
in the seat dir.

## Environment and tools

- Tools observed, no installs performed (nothing to record under the operator tooling rule):
  curl 8.23.0, git 2.56.0, node v24.21.0, jq, GNU coreutils. No pacman used (guard respected).
- Access discipline: read-only HTTP GETs only, to the surfaces this item names plus URL
  discovery probes for them (nodejs.org, developer.mozilla.org, raw.githubusercontent.com,
  api.github.com, git-scm.com, w3c.github.io). No logins, no forms, no consequential actions,
  no registry writes, no git/jj mutations of any repo; the one git fixture was `git init -q`
  under scratch with `rev-parse --show-toplevel` asserted equal to the fixture dir.

## Candidate rows (proposals only — SOURCES.md untouched; 151 rows at HEAD, last id S151)

### 1. node:crypto §crypto.sign API section — candidate id S152 — tier proposal A

- URL: https://nodejs.org/docs/latest-v24.x/api/crypto.html (same page as S150's pin).
- Surface: the `crypto.sign(algorithm, data, key[, callback])` section — the Ed25519
  signing contract the C1 receipt chain builds on.
- Quote (flat-byte contiguous, ≤25 words, no pipes): `Add support for Ed25519 context parameter.`
  — byte offset 617178; section bracket proof: §crypto.sign heading anchor at 616857 <
  617178 < §crypto.verify heading anchor at 628434, i.e. inside §crypto.sign, History,
  v24.16.0 row. wc -w = 6, pipes = 0.
- Depth vs S150: S150's quote sits at offset 85163 (top-of-page import code sample); this
  one sits at 617178 inside the sign section itself.
- Bytes integrity: live fetch 681,625 B, sha256 `4b7024df06e31080d4caa20b21aafb68a56d0481781633d7b5f7dc7ec50c42af`,
  byte-identical (cmp exit 0) to staged `.ufo/waves/round-43/sources/crypto.html` — today's
  re-open of S150's pin, so no new fetch pin needed for admission.
- Observed context in the same section (flattened, NOT the quote): "algorithm is required
  to be null or undefined for Ed25519, Ed448, and ML-DSA." (raw line 6768 — tag-fragmented,
  cannot be a flat quote); the `context` key-object option: "For Ed25519 (using Ed25519ctx
  from RFC 8032), Ed448, ML-DSA, and SLH-DSA," (raw lines 6804-6805). Host runtime
  node v24.21.0 ≥ v24.16.0, so the documented context parameter is present in the C1 runtime.
- Teaches: §crypto.sign anchors for the C1 signing call shape (null algorithm for Ed25519;
  Ed25519 context parameter since v24.16.0). Suggested used-by:
  corpus/knowledge/receipt-authenticity-signing-round-43.md. Evidence:
  `evidence/node-sign-section-quote.txt`, `evidence/fetch-sha256.txt`.

### 2. MDN WebCrypto Ed25519 surface — candidate id S153 — tier proposal B (recheck 90d)

- URL: https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/sign — there is NO
  dedicated MDN Ed25519 page: `/Web/API/SubtleCrypto/Ed25519` (404), `/Web/API/Web_Crypto_API/Ed25519`
  (404), `mdn/content files/en-us/web/api/subtlecrypto/ed25519/` (404). The Ed25519 WebCrypto
  surface lives inside sign().
- Surface: Ed25519 in WebCrypto sign/verify — parameter form `{ name: "Ed25519" }`, digest
  fixed to SHA-512, §Ed25519 prose (Curve25519 / EdDSA / RFC 8032).
- Quote (flat-byte contiguous): `For Ed25519 the digest algorithm is always SHA-512.`
  — live HTML byte offset 95012 (§Supported algorithms list); also mdn/content markdown
  line 58. wc -w = 8, pipes = 0.
- Stable anchor: mdn/content main `files/en-us/web/api/subtlecrypto/sign/index.md`,
  13,353 B, sha256 `5ba25f2568f7a2c6b0961938e8b9ad744b3e40186aeb6cd063b35627fd52abc3`,
  latest commit touching the path 77d90a23ee0a3b5486a7963f68ad4e56efb06a7b (2025-04-27);
  live page 171,569 B (full copies in evidence dir).
- Tier B rationale: community-edited secondary docs; and the browser-support table (BCD)
  is iframe-injected — NOT in the pinned bytes — so the row's scope must be the parameter/
  digest semantics, never support claims (S006/S007 B-pattern: secondary to spec text).
- Teaches: the WebCrypto-facing Ed25519 contract for the C1 signing surface. Suggested
  used-by: corpus/knowledge/receipt-authenticity-signing-round-43.md. Evidence:
  `evidence/mdn-sign-quote.txt`, `evidence/mdn-subtlecrypto-sign.html`, `evidence/mdn-sign-index.md`.

### 3. git cat-file §--batch-check (type+size in one call) — candidate id S154 — tier proposal A

- URL: https://git-scm.com/docs/git-cat-file (same page as S151's pin; S151 anchors §-t
  only; freeze forbids amending it, hence a new row).
- Surface: one-call object identification — `--batch-check` prints `<object> <type> <size>`;
  §BATCH OUTPUT describes stdin-driven same-order reads; §-s alone gives only size
  (contiguous quote "Instead of the content, show the object size identified by" verified
  present, pairing with S151's §-t quote).
- Quote (flat-byte contiguous): `Print object information for each object provided on stdin.`
  — byte offset 52468, §--batch-check definition (anchor id Documentation/git-cat-file.txt---batch-check,
  raw line 2342). wc -w = 9, pipes = 0.
- Bytes integrity: live fetch 79,360 B, sha256 `624464ef7a3d64de06038200bff85ac09389a9d217d379dd660aa6b5165048d7`,
  byte-identical to staged `.ufo/waves/round-43/sources/git-cat-file.html` (S151's pin).
- RUN OBSERVATION (not asserted — run in a scratch fixture, git 2.56.0, toplevel asserted):
  - `printf '%s\n' $B | git cat-file --batch-check` → `05befef3d2572fb83755fdcec4ccef0a278f8833 blob 17`
    (name+type+size in ONE call; the two-call equivalent `-t`/`-s` gives blob / 17).
  - `printf 'tree 4b825dc642cb6eb9a060e54bf8d69288fbee4904\n' | git cat-file --batch-check`
    → `tree 4b825dc642cb6eb9a060e54bf8d69288fbee4904 missing`. CAVEAT for the C2 instrument:
    batch-check does not fail closed on a missing object — it prints type field "missing";
    the gate must match the TYPE FIELD (blob vs tree, the r1 discipline), never call success.
- Teaches: batch-check as a one-call type+size instrument candidate for the C2 checker's
  committed-bytes gate. Suggested used-by: the C2 checker line of work. Evidence:
  `evidence/git-cat-file-batch-check-quote.txt`, `evidence/batch-check-demo-receipt.txt`.

### 4. WebDriver BiDi network command reference — candidate id S155 — tier proposal A

- URL: https://w3c.github.io/webdriver-bidi/ (Living Standard; S005 pins the dated TR WD
  at w3.org — different URL, on-release recheck surface).
- Surface: §7.5.5 network module commands network.addIntercept (§7.5.5.2) through
  network.setCacheBehavior (§7.5.5.13) and the network-intercept definition; addIntercept
  params phases/context/urlPatterns; InterceptPhase = beforeRequestSent / responseStarted /
  authRequired (raw lines 10839-10840 — tag-fragmented, context only).
- Quote (flat-byte contiguous): `is a mechanism to allow remote ends to intercept` — byte
  offset 1012206, raw line 9241, §network-intercept definition (continuation line 9242:
  "and modify network requests and responses."). wc -w = 9, pipes = 0.
- Spec bytes: 4,235,329 B, sha256 `d07f85f8afd9e2d2ee616832f4f280ffd2c9ba06ff00b5ad9591eb5ad2b8e1bb`.
- Teaches: BiDi network interception semantics for a Playwright Firefox chain (which phases
  can be intercepted and with what parameters). Suggested used-by:
  corpus/knowledge/webdriver-bidi-capability-matrix.md. Evidence: `evidence/bidi-spec-network-quote.txt`.

### REJECTED candidate (coverage finding): MDN BiDi Network module page

- https://developer.mozilla.org/en-US/docs/Web/WebDriver/Reference/BiDi/Modules/network
  (155,226 B after 301 to lowercase path, sha256 `5367f4f9e62c22eabc9a278b191e34e120eabd633b913673f2548746e0ac7576`).
- REJECTED: the fetched bytes contain zero occurrences of "intercept" (case-insensitive)
  and no network command names — 91 lit-part hydration markers, only Modules/* nav links
  are in-band. Client-rendered body ⇒ no ≤25-word flat quote can ever locate in fetched
  bytes ⇒ inadmissible under the flat-quote convention. Any future MDN BiDi module row must
  anchor mdn/content markdown (as proposed for S153), not the rendered page.

## Row-format compliance (per SOURCES contract v1)

All four proposed quotes: verbatim flat-byte substrings of fetched pages (offsets recorded),
≤25 words (6/8/9/9), zero pipe characters, 11-cell row shapes with tier scoped to the row's
scope cell, status `mined`, suggested recheck: S152 on-release, S153 90d, S154 on-release,
S155 on-release. No registry write was performed — these are proposals for the admit flow.

## Bounds, cleanup, limitations

- Writes: only `.ufo/waves/round-43/w1/ScoutSourceCandidates{,.md}` (seat dir + named report
  path) and scratch `/fast/scratch/hyaku/tabi-r43/ScoutSourceCandidates/` (deleted before
  yield). No writes to the production tree, fleet repo, sibling repos, or shokuknow; no
  commits/pushes; no registry writes; no PATH-dir writes.
- Evidence: SHA256SUMS.txt over the evidence dir; full fetched copies kept for the two new
  MDN artifacts; for the node and git pages the in-repo staged pinned copies are the bytes
  (proven byte-identical today by cmp); the 4.2 MB BiDi spec bytes were hashed and excerpted
  (offsets recorded) and the full fetch was transient in scratch.
- Limitations: single-instant re-opens (drift only provable at sampled instants); MDN live
  pages are rolling content (content-commit anchor recorded where available); BiDi spec is
  a living standard (no dated pin until admission); BCD support tables are client-rendered
  and out of scope for every proposal; the InterceptPhase enumeration and the node
  null-algorithm sentence are tag-fragmented in raw HTML and recorded as flattened context,
  never as quotes.

VERDICT ok 4 frontier surfaces evaluated read-only: 3 new-row proposals with offset-verified ≤25-word flat quotes (node §crypto.sign on the S150-pinned bytes, MDN sign §Ed25519 at content commit 77d90a23, git --batch-check on the S151-pinned bytes with a run-observed one-call type+size demo) + BiDi living-standard §network; 1 MDN Network-page candidate rejected (client-rendered bytes, quote cannot locate)
