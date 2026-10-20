VERDICT: PASS

# C1 freshness recheck — rows S008, S009 (seat Recheck04)

Lane tip at start/end: `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin rev-parse --verify refs/heads/master`
→ `2bff864fdfee684ddbcd066cc8e735adaba2735c` (= baseline B).
Producer (single normalizer, `.ufo/waves/round-18/recheck-fetch.mjs` at the lane tip):
sha256 `f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360`.
Both receipts were produced ONLY by the tool (`exit 0`, `quoteFound=true`, `http=200`), decode `html-text`,
seat `Recheck04`, `fetchedAt` 2026-10-20T19:05:41Z. No superseding row is drafted: both rows `held`.

## S008 — https://www.selenium.dev/documentation/webdriver/bidi/

- Row: `corpus/SOURCES.md:22`; `rowUrl` occurs verbatim in that row's `source` cell (verified by substring test, `rowUrlInSourceCell=true`).
- teaches cell: "Selenium exposes BiDi through a WebSocket capability and low-level domains; binding support is a per-API fact".
- Anchor cell says `last modified 2026-08-15, §Enabling BiDi in Selenium`.
- Fetch: http 200, bytes 92317, full sha256 `c919558a0ec5e42fb7b33560d633f508dd6f30dfb39f4821270cdfe0b3a9c97b`.
  This is byte-identical to the round-1 seat sha256 in `corpus/lessons/kaika-fleet-round-1.md:51` → no body change since the row was opened.
- Quote (original Gate quote, 14 words, found at normalized offset 4770): "The low-level BiDi domains will be accessible in the code to the end user" — source `corpus/lessons/kaika-fleet-round-1.md:51` (unchanged quote-source, not `new`).
- Anchor observed in body: `Last modified August 15, 2026:` footer + `Enabling BiDi in Selenium` heading at normalized offset 2433 → matches the anchor cell's 2026-08-15.
- Verdict: **held**. Body still grounds every clause of teaches: enabling is via the capability
  (`options.setCapability("webSocketUrl", true);` / Python `options.enable_bidi = True`), low-level domains are the
  undocumented-but-accessible layer ("the low-level components will not be documented"), and the per-language snippets
  differ, i.e. binding support is a per-API fact.
- Receipt `corpus/evidence/round-18/source-recheck/S008.json` sha256 `e9fc23be944670e4572bf8c89ca73114848f04b967d3da8e8108b7a6438b91ee`;
  excerpt `S008.excerpt.txt` sha256 `9005e2117b109d0c036cd7c658ae70bd85c3e9578e5d15a5718c6476a4841122` (= receipt `excerptSha256`).

## S009 — https://www.selenium.dev/documentation/webdriver/bidi/w3c/network/

- Row: `corpus/SOURCES.md:23`; `rowUrl` occurs verbatim in that row's `source` cell (`rowUrlInSourceCell=true`).
- teaches cell: "The Python intercept API is marked provisional, so \"BiDi supported\" must be scoped per binding, release and command".
- Anchor cell says `page modified 2026-07-23, §Add network intercept, v4.32 Python example`.
- Fetch: http 200, bytes 1274369, full sha256 `84a9db7fa1063664af92b6a2b353c5849d81836ddb0ce9a098bdca241b30187d`.
  Byte-identical to the round-1 seat sha256 in `corpus/lessons/kaika-fleet-round-1.md:52` → no body change since the row was opened.
- Quote (original Gate quote, 10 words, found at normalized offset 2042): "This will be updated when a public API is stabilized." — source `corpus/lessons/kaika-fleet-round-1.md:52`.
- Anchor observed in body: `Last modified July 23, 2026:` footer + `Commands … Add network intercept …` TOC entries and the
  `Selenium v4.32` Python example heading at normalized offset 1876 → matches the anchor cell's 2026-07-23.
- Verdict: **held**. The body still carries `@pytest.mark.driver_type("bidi") def test_add_intercept(driver)` with
  `# _add_intercept is currently the available Python API for BiDi network intercepts.` and
  `driver.network._add_intercept()` — an underscore-prefixed, comment-flagged unstable API, scoped to one binding
  (Python), one release heading (v4.32) and one command (add network intercept). The teaches wording "marked
  provisional" is a fair characterization of that "currently … will be updated when a public API is stabilized" note
  (the literal word "provisional" does not occur in the body) — [INFERENCE] this is a paraphrase, not an overstatement,
  since the body explicitly marks the API as not-yet-stabilized.
- Receipt `corpus/evidence/round-18/source-recheck/S009.json` sha256 `acdf09126212e450d3ff28764e2b21581864d2b779bdb069a2a32d91c0907639`;
  excerpt `S009.excerpt.txt` sha256 `7de943cf0ffcde31587df40ace66d94e22af2ae6c542f771d879ff60263a300e` (= receipt `excerptSha256`).

## Contract self-check (both receipts, run locally against the tool's own `normalize`)

`schema=tabi-source-recheck-v1`, `rowInSources=true`, `rowUrlInSourceCell=true`, `sha256` 64-hex,
`quoteWords` equals the actual word count and ≤25, `normalize(quote) ⊆ normalize(excerpt)`, `excerptSha256`
equals the sha256 of the excerpt bytes, `quoteFound=true`, `fetchedAt` on 2026-10-20, `teachesVerdict=held`,
`httpStatus=200`, `producerSha256` equals the sha256 of `recheck-fetch.mjs` → all true for S008 and S009 (`ok=true`).
Neither row is in the C1 superseded set (S004/S039/S047/S049/S050/S053), so both are counter-eligible.

## Observed vs inference vs unresolved

- Observed: HTTP status, byte counts, digests, quote offsets, anchor date strings, teaches-supporting snippets —
  all from the tool output and `--normalize-only` probes on the same bodies.
- [INFERENCE] the S009 "provisional" paraphrase judgement above.
- Unresolved: none for these two rows. `measure-c1.mjs` does not exist at the lane tip
  (`ls .ufo/waves/round-18/measure-*.mjs` → no such file), so the counter run belongs to its own owner; these two
  receipts are ready for it. `git status --porcelain` shows only the untracked round-18 wave/evidence dirs.
- Tooling: no installs or upgrades were needed (node v24.x and curl were already present); no pacman transaction run.

Files written:
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S008.json
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S008.excerpt.txt
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S009.json
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S009.excerpt.txt
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w1/Recheck04.md
