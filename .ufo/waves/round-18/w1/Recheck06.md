VERDICT: PASS

# C1 source recheck — Recheck06 (rows S012, S013)

Lane tip at run: `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin rev-parse --verify refs/heads/master`
→ `2bff864fdfee684ddbcd066cc8e735adaba2735c` (= B). Producer used by both receipts:
`sha256 .ufo/waves/round-18/recheck-fetch.mjs` = `f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360`
(note: that file is untracked at B, `git status --porcelain` → `?? .ufo/waves/round-18/recheck-fetch.mjs`;
the counter's `producerSha256` matches once L1 commits it).

Both receipts were produced only by `node .ufo/waves/round-18/recheck-fetch.mjs … --seat Recheck06`
(no hand edits), `quoteFound=true`, exit 0. A scripted re-read of both JSONs against the counter
contract returned `CONTRACT_OK` for each: schema `tabi-source-recheck-v1`, 64-hex `sha256`,
`quoteWords` ≤ 25 and equal to the quote's word count, `normalize(quote)` inside
`normalize(excerpt)`, `excerptSha256` equal to sha256 of the excerpt file bytes, `fetchedAt` on
2026-10-20, `httpStatus` 200, `teachesVerdict=held`.

## Row S012 — chromium-bidi README (`corpus/SOURCES.md:26`)

- URL in row: `https://github.com/GoogleChromeLabs/chromium-bidi` (fetch URL identical; occurs verbatim in the row's source cell).
- http 200 · bytes 527500 · sha256 `b1b0c3dacda9418a61a68be19cabd6eb97e846945d5909eab979a75c06c09a63` · decode html-text.
- Quote (15 words, `corpus/lessons/kaika-fleet-round-1.md:55`): "implemented as a JavaScript layer translating between BiDi and CDP, running inside a Chrome tab" — found at normalized offset 4098.
- Verdict: **held**.
- Anchor observed: the live repo page carries main HEAD `7037906ac49e2690868c4db0ec88b61b99b94d15`; the anchored README at commit `1c6f4363b532258da7f4732deba2656a1a4fea45` (committed 2026-10-14T09:59:14Z, "[chromium-bidi] Document the npm publishing process in README") fetched via
  `https://raw.githubusercontent.com/GoogleChromeLabs/chromium-bidi/1c6f4363/README.md` → 200, 22873 B,
  sha256 `f3a626db446bda23866afbeab6e5d0f6a60de10f30b0ea7de821ceda356af401`, **byte-identical to the README at `main`** (same digest) — so main advanced (7037906a) without touching the quoted text.
- Teaches check (observed on the same live body, re-fetched with the receipt's exact curl argv: 200, 527500 B,
  sha256 `8c9758eb33f8968b265b08983d7d4cecb92ab18bbdfb034a597512359ed28bf3`): page text contains the §WebDriver BiDi for Chromium layer sentence, the `BiDi+` heading, 8 `goog:cdp` occurrences (`goog:cdp.sendCommand`, `goog:cdp.getSession`, `goog:cdp.resolveRealm` in the raw README), and the top notice "the source was moved to Chromium … chromium.googlesource.com/chromium/src/+/main/third_party/chromium-bidi". The teaches cell (JS BiDi→CDP layer inside a tab; BiDi+ `goog:cdp.*` non-standard; statement proves no individual command) still holds.
- Maintenance facts for the knowledge file (not drift): the repo is **not** archived (page payload `isArchived:false`); the README now says the source moved into `chromium/src` third_party with mirrored commits. The row URL is dynamic: the 2026-10-19 seat fetch digest `992ec9d3d60bbe36bb7d804d695fc57fefb651589115c4efb96239307ac1d866` differs from today's `b1b0c3da…` while the quoted sentence is present — same class as the S001 dynamic-page difference recorded at `corpus/lessons/kaika-fleet-round-1.md:73`.
- Drift draft: none.

## Row S013 — Playwright Retries (`corpus/SOURCES.md:27`)

- URL in row: `https://playwright.dev/docs/test-retries` (fetch URL identical; occurs verbatim in the row's source cell).
- http 200 · bytes 99073 · sha256 `cf48ff4db0a305f9c1a8a829b60c295041e22daa0e018c4286ae182832ffbdfa` · decode html-text.
- Quote (13 words, `corpus/lessons/kaika-fleet-round-1.md:56`): `"flaky" - tests that failed on the first run, but passed when retried` — found at normalized offset 3529.
- Verdict: **held**.
- Anchor observed: serve date 2026-10-20; the body carries no version or date marker (stable, unversioned docs page), and the fetched sha256 is **exactly** the 2026-10-19 seat-fetch digest recorded in the round-1 Gate — the page bytes are unchanged since the row was opened. (An independent curl in this run wrote the same 99073 bytes with the same digest, so full-body observations below apply to the receipt body.)
- Teaches check: §Retries still prints the three categories verbatim (`"passed"`/`"flaky"`/`"failed"`), and the run summary in the same section keeps both attempts (`x … second flaky (691ms)`, `✓ … second flaky (522ms)`, `1 flaky`), plus `testInfo.retry` for attempt identity — grounding "flaky, not passed; keep every attempt".
- Drift draft: none.

## Notes

- No tool installs, no pacman transaction, no git write, nothing outside the owned paths written; `jj` untouched.
- /tmp scratch (`/tmp/r18-*`) removed after the run.

Files written:
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S012.json
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S012.excerpt.txt
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S013.json
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S013.excerpt.txt
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w1/Recheck06.md
