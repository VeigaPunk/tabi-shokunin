VERDICT: PASS

# C1 freshness — S020 and S021 rechecked (seat Recheck10)

Both rows re-opened against their live source on 2026-10-20 (lane tip
`2bff864fdfee684ddbcd066cc8e735adaba2735c`). Both **held**: the original Gate quote is present
verbatim in the live body under `html-text` decode, and the body still supports each row's
`teaches` cell. Receipts were produced only by
`node .ufo/waves/round-18/recheck-fetch.mjs` (schema `tabi-source-recheck-v1`); no hand edit.

## Row S020 — WebMCP (CG draft)

- Row at lane tip: `corpus/SOURCES.md:34`
  (`| S020 | WebMCP — https://webmachinelearning.github.io/webmcp/ | spec | A | … | mined | 2026-10-19 |`)
- Fetch (`command` field of the receipt):
  `curl -sSL --compressed --max-time 90 -A 'Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18' … 'https://webmachinelearning.github.io/webmcp/'`
  → **http 200, 511987 bytes**
- sha256: `5627596668946732cffb354d265d01f20ebba7d436a46a646e0768751d63ca40`
  (an independent `curl` with a Chrome UA produced the identical byte count and digest)
- Quote (13 words; `quote-source` = original Gate quote, `corpus/lessons/kaika-fleet-round-1.md:63`):
  "The WebMCP API enables web applications to provide JavaScript-based tools to AI agents."
  — found at normalized offset 586, Abstract.
- Anchor observed: `<meta name="revision" content="51ed75653aaa7f174f8dbe05d1bc327359bbc57c">`
  and `<time class="dt-updated" datetime="2026-10-20">20 October 2026</time>`; status `CG-DRAFT`.
  The row's anchor cell records `CG-DRAFT 2026-10-16, revision f14762e6`, i.e. the editor's draft
  has rolled since it was opened. That same later revision (51ed7565) was already recorded during
  round-16 wave 2 (`corpus/SOURCES.md:97`, "S020's live page served a later editor-only revision
  (51ed7565) during wave 2; the anchor cell stays as opened"), so this is the known rolling-anchor
  state, not a new change.
- Verdict: **held**. Abstract sentence verbatim; Status of this document still says the spec "is
  not a W3C Standard nor is it on the W3C Standards Track"; §4.1 "Extensions to Document" and the
  `ModelContext*` IDL types are still present. Exactly the teaches cell ("pages expose JavaScript
  tools to agents; a CG draft, not a W3C Standard").
- Drift draft: none — no superseding row needed; `teaches` is not overstated and the changing part
  is the rolling revision marker, not the claim.

## Row S021 — Chrome DevTools for agents

- Row at lane tip: `corpus/SOURCES.md:35`
  (`| S021 | Chrome DevTools for agents — https://developer.chrome.com/docs/devtools/agents | docs | A | … | queued | 2026-10-19 |`)
- Fetch (`command` field of the receipt):
  `curl -sSL --compressed --max-time 90 -A 'Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18' … 'https://developer.chrome.com/docs/devtools/agents'`
  → **http 200, 125482 bytes**
- sha256: `30dd763c0276474d6c1f7902ab3f3375baeea8bc74965db3903472f25112fe73`
  (an independent `curl` with a Chrome UA returned 125478 bytes / `d101f479385bbdcef3fbd50c2092e336ba530c77f2c78237b97846712a2497fd`;
  the 4-byte delta is UA-dependent devsite chrome. The receipt's own fetch is canonical and is the
  one `measure-c1.mjs --live` reproduces.)
- Quote (10 words; `quote-source` = original Gate quote, `corpus/lessons/kaika-fleet-round-1.md:64`):
  "Help your agent build, debug, and verify your code correctly."
  — found at normalized offset 2031, page intro.
- Anchor observed: JSON-LD `"dateModified": "2026-03-22"`; no in-body revision marker, matching the
  row's anchor cell ("rolling docs, no revision marker, read 2026-10-19"); title
  "Chrome DevTools for agents".
- Verdict: **held**. The body still presents this as the supported, documented agent surface over
  Chrome: the intro sentence verbatim; "With Chrome DevTools for agents, your AI agent can interact
  with the Chrome browser to test code, emulate users, and catch bugs"; "Debug your live browser";
  and "see agents debugging and verifying autonomously". That grounds the teaches cell
  ("The supported high-level alternative to raw CDP for agent debugging and verification workflows").
- Precision note: the page body contains no occurrence of "CDP" or "Chrome DevTools Protocol"
  (`grep -o -i 'CDP\|Chrome DevTools Protocol'` → 0 matches), so the "alternative to raw CDP" clause
  is the lane's comparative framing against the CDP rows, not a claim the page makes about itself.
  Recorded here rather than as drift: the page-level claim (supported, documented, high-level agent
  integration for debugging/verification) is fully supported.
- Drift draft: none.

## Counter-rule self-check (what I actually ran)

- `schema` = `tabi-source-recheck-v1`, `row` = S020/S021, both present at the lane tip and neither in
  the superseded set (superseded at B: S004, S039, S047, S049, S050, S053).
- `rowUrl` occurs verbatim in each row's source cell at tip B (`git show 2bff864:corpus/SOURCES.md`
  lines 34 and 35).
- `quoteWords` 13 / 10 (≤25); `quoteFound` true for both (tool exit 0).
- `excerptSha256` recomputed from the written excerpt bytes matches the receipt:
  S020 `0826db261d9729cdbb6fdc50e8740e1eb0455bc4c386028740c35e45adf6557a`,
  S021 `792b6959ac0c7091d22355db316488b63cc851151732fe1d37931289765306c6`.
- `httpStatus` 200 both; `fetchedAt` 2026-10-20 (`2026-10-20T19:05:54.125Z`, `…:54.433Z`);
  `teachesVerdict` = `held` both.
- `producerSha256` = `f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360`
  = `sha256sum .ufo/waves/round-18/recheck-fetch.mjs`. Note: the tool does not exist in the
  committed tree at B (`git show 2bff864:.ufo/waves/round-18/recheck-fetch.mjs` → "exists on disk,
  but not in …"), so this digest necessarily comes from the working-tree file; it must equal the
  blob at REV once the round-18 wave files are committed.

## Unreachable retries

None needed — both sources answered http 200 on the first attempt.

## Tooling installs

None; no tool installed or upgraded during this run (Node v24.21.0 and curl from the host sufficed).

Files written:
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S020.json
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S020.excerpt.txt
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S021.json
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S021.excerpt.txt
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w1/Recheck10.md
