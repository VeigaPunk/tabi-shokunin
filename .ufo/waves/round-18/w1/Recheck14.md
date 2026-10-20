VERDICT: PASS

C1 freshness recheck, seat Recheck14. Two rows assigned: S028, S029. Both receipts produced ONLY by
`node .ufo/waves/round-18/recheck-fetch.mjs` (schema `tabi-source-recheck-v1`), `quoteFound=true`,
`teachesVerdict=held`, `fetchedAt` 2026-10-20. No drift drafts (no row judged `drift`). No unreachable rows.
Lane tip at run time: `git -C LANE rev-parse --verify refs/heads/master` → 2bff864fdfee684ddbcd066cc8e735adaba2735c;
`git status --porcelain corpus/SOURCES.md` printed nothing.

## S028 — `remote_debugging_server.cc`, chromium main (Gate quote from round 12)

- Row: `corpus/SOURCES.md:42`; source cell URL `https://github.com/chromium/chromium/blob/main/chrome/browser/devtools/remote_debugging_server.cc`; location cell `.cc:169-177`; teaches = the `supersedes S004 —` cell.
- Fetch: `--url https://raw.githubusercontent.com/chromium/chromium/main/chrome/browser/devtools/remote_debugging_server.cc --decode none`
  → **http 200, 15057 bytes** (wire `content-length: 3997`, gzip; digest is over the decompressed body),
  **sha256 `ea72757acd7c3bff419db92bf5be101256c1bc813fcb87174a401fc8856901cc`** — byte-identical to the
  row-recorded L1 re-fetch `ea72757a…01cc`, so the body has not changed since 2026-10-19.
- Quote (10 words, original Gate quote, still verbatim at `.cc:113-114`):
  `Prefers a free port over switching from IPv4 to IPv6.`
  quote-source `corpus/lessons/round-12.md:47` (Gate table row for S028).
- Anchor observed: `main @ 9bb1a1e18b5ac9c29103056f91a30897b32367b0` (latest commit touching this path per
  `api.github.com/repos/chromium/chromium/commits?path=…&per_page=1`, commit date 2026-10-05T04:25:50Z,
  "[dcheck-to-check] Convert DCHECKs in chrome/browser/ [9/25]").
- Verdict **held**. Teaches support in the body: `.cc:162-183` `IsRemoteDebuggingAllowed` — `:169` `#if BUILDFLAG(GOOGLE_CHROME_BRANDING)` / `:170` `constexpr bool default_user_data_dir_check_enabled = true;`, `:171-173` `#else` runtime flag, `:176-177` `if (default_user_data_dir_check_enabled && is_default_user_data_dir.value_or(true))` → `kDisabledByDefaultUserDataDir` (fails closed on absent data). Anchor lines `:169-177` still land on exactly this block.
- Mechanism nuance recorded (not drift): the refusal *code* is compiled on all desktop builds
  (`IS_WIN||IS_MAC||IS_LINUX`); only the default-enabled value is branding-constexpr. Unbranded builds read
  `g_enable_default_user_data_dir_check_for_chromium_branding_for_testing`, initialised `false` (`:50-51`) and
  set true only by `EnableDefaultUserDataDirCheckForTesting()` (`:291-294`). So the row's operative claim —
  unbranded Chromium (this host) does not enforce it, inferred from source, never observed by a launch — holds;
  "compiled only under" is shorthand for "enabled by default only under". Kept `held`; note field states it.
- Receipt: `corpus/evidence/round-18/source-recheck/S028.json` (+ `S028.excerpt.txt`, 1254 bytes,
  sha256 `e252d1084c1c2d04e6ee28f4cfcacaca07a222cbb8067ac2b6021f08e989ba59`).

## S029 — own-work, `corpus/evidence/round-13/aria/receipt.json` (committed at 837b33a)

- Row: `corpus/SOURCES.md:43`; source cell path `corpus/evidence/round-13/aria/receipt.json` (occurrence verified verbatim); location cell `cleanup.server.perWorker[0].listeningAfter, runtime.node and pin.node`.
- Fetch (own-work, no Gate quote): `git -C LANE show 837b33a3988ebeea7f6b4ef5c04698da88909a73:corpus/evidence/round-13/aria/receipt.json`
  → **http null (non-HTTP), 97073 bytes, sha256 `b458b351430388485aad1594640589809bf2eda59367b016d7e1d3a45a1989b7`**.
  Byte-identical (`cmp`) to `git show refs/heads/master:corpus/evidence/round-13/aria/receipt.json` — the
  committed input is still current at the lane tip.
- Quote (17 words, `--quote-source new`, derived from the committed JSON because no Gate quote exists):
  `"listeningAfter": true, "refusedAfterClose": true, "ok": true, "perWorker": [ { "origin": "http://127.0.0.1:40983", "listeningBefore": true, "closed": true, "listeningAfter": false,`
- Anchor observed: commit `837b33a3988ebeea7f6b4ef5c04698da88909a73`; blob sha256 `b458b351430388485aad1594640589809bf2eda59367b016d7e1d3a45a1989b7`; unchanged at lane tip `2bff864f…735c`.
- Verdict **held**. Field evidence: `cleanup.server.perWorker[0].listeningAfter = false` while
  `cleanup.server.listeningAfter = true` (aggregate); `runtime.node = "26.12.0"` while
  `pin.node.recorded = "24.21.0"` (`pin.node.minimumMajor = 20`). No new runtime observation is claimed.
- Receipt: `corpus/evidence/round-18/source-recheck/S029.json` (+ `S029.excerpt.txt`, 1382 bytes,
  sha256 `80b5de21689b1ab7c951d245465502b40747c25d77e5f5c652c143629c3796ff`).

## Contract self-check (narrow, over my two receipts only)

Local re-implementation of the PLAN §C1 receipt rules, reading `corpus/SOURCES.md` from
`refs/heads/master` (not the working tree) and the producer bytes:
schema `tabi-source-recheck-v1`; row present and not in the superseded set; `rowUrl` verbatim in the
row's source cell; 64-hex `sha256`; `quoteWords` = word count ≤ 25; `normalize(quote)` ⊆
`normalize(excerpt)`; `excerptSha256` = sha256 of excerpt bytes; `quoteFound` true; `fetchedAt` on
2026-10-20; `teachesVerdict` held; `httpStatus` 200 for S028 / null for the own-work row; `producerSha256`
= sha256 of `.ufo/waves/round-18/recheck-fetch.mjs` = `f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360`; receipt `bytes` equals the fetched/supplied body size.
Output: `S028 ALL_OK`, `S029 ALL_OK`.

## Remaining unknowns / notes for L1

- Only a `held` verdict was emitted; neither row needs a superseding SOURCES row, so SOURCES.md is untouched by this seat.
- S028's teaches cell compresses the branding gate; the `#else` test-flag branch (`:50-51`, `:291-294`) is the only imprecision and is already captured in `corpus/knowledge/source-recheck-round-12.md:75` ("then the testing build that sidesteps it"). Flagged here rather than superseded.
- No tools installed or upgraded; no pacman transaction attempted; no browser used; no git writes (read-only `show`/`rev-parse`/`status`/`cat-file` only). Scratch bodies under `/tmp/r18-recheck14/` are outside LANE and are left for the host, not committed.

Files written:
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S028.json
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S028.excerpt.txt
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S029.json
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S029.excerpt.txt
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w1/Recheck14.md
