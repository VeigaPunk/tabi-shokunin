# ReopenS131 — row S131 (chromium-bidi mapper CdpTargetManager.ts @ 154.0.8037.97)

**Verdict: HOLDS, with two minor (cosmetic/provenance) notes, no defect that changes any claim.** I re-fetched the cited document and README.chromium independently; both byte-hashes in the row equal what I measured (raw 20,140 B `f3483993…c33599`, decoded 15,104 B `cd435aa8…5cce9d9`; README decoded `bc5088bc…b33766`). Every anchor the row cites is where it says (`case 'page':` 223, `BrowsingContextImpl.create(targetInfo.targetId, parentId,` 245-247, frameAttached `create(params.frameId, params.parentFrameId,` 135-136). The row parses as 11 cells, no `|` inside, kind `code`, tier `A`, used-by file cites S131 (lines 1 and 63). The entry's claim ("mapper names a top-level context by the CDP targetId verbatim") is what the bytes say; I also checked `BrowsingContextImpl.ts` (not cited by the row) — `get id()` returns the constructor id and every emitted `context:` is `this.id`, so there is no re-encoding on the way out. The "upper-case 32 hex" step is correctly attributed to S130, not S131.

## Fetches (curl -q -sS --proto =https; Gitiles ?format=TEXT, base64 -d)
| URL (…/chromium/src/+/refs/tags/154.0.8037.97/) | UTC | HTTP | bytes | sha256 |
|---|---|---|---|---|
| third_party/chromium-bidi/src/bidiMapper/modules/cdp/CdpTargetManager.ts?format=TEXT | 2026-10-26T20:12:33Z | 503 (first try, body = Google error page, not hashed; base64 -d exit 1) | 1,459 | (503 body, discarded) |
| same | 2026-10-26T20:12:38Z | 200 | raw 20,140 | raw `f3483993a72e09531b8efe322ca317727f8241c06b708ddc8270c88102c33599`; decoded 15,104 B `cd435aa8cbbd0a1e908e48c3190be7120aa76cf918cb81d814d55d1ad5cce9d9` |
| third_party/chromium-bidi/README.chromium?format=TEXT | 2026-10-26T20:12:48Z | 200 | raw 1,592 | decoded `bc5088bce94c55c3e87d6e9287a18300afc8dd01efe7c7184ba3880739b33766` (lines 1-6 exactly as row quotes: Version 17.0.2, Revision d3bda5af…1ac9, Update Mechanism Static.HardFork) |
| tag object `…/154.0.8037.97?format=JSON` | 2026-10-26T20:13:05Z | 200 | (head only) | `"commit": "b510e9d7cd3a2fbd78d0ddc42234103206c5f78d"` = row's commit |
| third_party/chromium-bidi/src/bidiMapper/modules/context/BrowsingContextImpl.ts?format=TEXT | 2026-10-26T20:13:05Z | 200 | decoded 67,674 | `0dedd1123eed52d3f4a1c7b421373b9f062f449331349940daffcec252d28f17` |
| chrome/test/chromedriver/BUILD.gn?format=TEXT | 2026-10-26T20:13:26Z | 200 | decoded 19,990 | `4cea6c0c6f9f394ef533ae047b5cf44463e109eccf887e421b50b04abcfb2166` |
| chrome/test/chromedriver/chrome/BUILD.gn?format=TEXT (guess) | 2026-10-26T20:13:31Z | 404 | body empty-decoded (guessed path; irrelevant) | — |

Exit codes: all curl calls exit 0; the one `base64 -d` on the 503 body exit 1 (expected); other decodes exit 0. The 503 was transient; row's receipt is reproduced.

## Anchor evidence (decoded CdpTargetManager.ts)
- 223-224 `case 'page':` / `case 'iframe': {` — row cites 223 `case 'page'` ✓ (page shares the branch with `iframe`).
- 244 `// New context.`; 245 `BrowsingContextImpl.create(`; 246 `targetInfo.targetId,`; 247 `parentId,`; 248 `userContext,`.
- 135-136 `BrowsingContextImpl.create(` / `params.frameId,` (in `#handleFrameAttachedEvent`, 132-136) ✓; `params.parentFrameId` is line 137 (row's "135-136" range, with `params.parentFrameId` in its quoted gloss, is one line short — trivial).
- 326-331 `#findFrameParentId`: `if (targetInfo.type !== 'iframe') return null;` → a `page` target is created with parentId null, i.e. top-level — supports "top-level" wording.
- BrowsingContextImpl.ts:247-248 `get id() { return this.#id; }`; `context: this.id` at 459 etc.

## Minor notes (none changes a claim; route to round 35 if wanted)
1. **Lesson Gate quote locator** (`lessons/round-34.md:33`): quote is "// New context. BrowsingContextImpl.create( targetInfo.targetId, parentId, userContext," — whitespace-joined lines 244-248, but locator says `:245-247`. `// New context.` is 244 and `userContext,` is 248. Words ≈7 (≤25 ok); text is present verbatim; only the line locator is narrow. Severity: cosmetic.
2. **Row S131 says "the mapper ChromeDriver 154 uploads"** but none of its cited bytes (CdpTargetManager.ts, README.chromium `Shipped: yes`) link ChromeDriver to this vendored copy. The link is true — `chrome/test/chromedriver/BUILD.gn:76-94` `minify_bidimapper` takes `//third_party/bidimapper` and `embed_bidimapper_in_cpp` embeds `mapper.js` — but that file is not in the row's anchor or in S125's. Provenance gap in the row (claim true, evidence not cited), severity low. Also the row's scope says "not id shape (S130 owns that)" while its `teaches` says "S130's upper-case 32-hex shape is the BiDi context id shape" — a deliberate chained inference, stated honestly, mild tension only. Also the row's text covers `page`; the `iframe` OOPIF branch (same `create(targetInfo.targetId…)`) and the `tab` case (207, returns without a context) are unmentioned; the entry correctly limits scope to page targets ("tab targets were not read").

## Overreach check
Entry line 1 and §3 claim: mapper names top-level context by CDP targetId verbatim (S131) — supported. Lower-case refusal rests on S130 (+ `token.cc:46-47` FromString), not S131 — supported by attribution. No overreach found.

## Deliverables
- This report; decoded byte copies in `.ufo/waves/round-34/w2/ReopenS131/` (CdpTargetManager.decoded.ts, README.chromium.decoded.txt, BrowsingContextImpl.decoded.ts).
- Scratch `/fast/scratch/hyaku/tabi-r34/ReopenS131` removed. No lane files edited, no tools installed.
