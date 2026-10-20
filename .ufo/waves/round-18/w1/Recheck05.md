VERDICT: PASS

# C1 freshness — S010, S011 rechecks (seat Recheck05)

Lane root: /home/vgpnk/Projects/shokunin/tabi-shokunin (LANE). Lane tip `refs/heads/master` =
2bff864fdfee684ddbcd066cc8e735adaba2735c (observed via `git rev-parse --verify refs/heads/master`).
Neither row is in the PLAN superseded set (S004, S039, S047, S049, S050, S053), and both are present in
`corpus/SOURCES.md` (`:24` S010, `:25` S011). No `jj`/git write was run; the only worktree change I made is
the untracked receipt directory (`git status --porcelain` → `?? corpus/evidence/round-18/source-recheck/`).

## Producer

Receipts were produced ONLY by
`node /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/recheck-fetch.mjs` (schema
`tabi-source-recheck-v1`, decode `html-text`, tool's own `curl -sSL --compressed --max-time 90 -A ...` fetch;
argv recorded in each receipt's `command`). Producer digest =
`f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360`
(`sha256sum .ufo/waves/round-18/recheck-fetch.mjs`).
Caveat for L1: that file exists on disk but NOT in `refs/heads/master` yet
(`git show refs/heads/master:.ufo/waves/round-18/recheck-fetch.mjs` → `fatal: path ... exists on disk, but
not in 'refs/heads/master'`). The C1 contract wants `producerSha256` = sha256 of the tool at REV, so REV must
commit this exact byte content; any later edit to the tool invalidates both receipts.

## S010 — held

- Row: `corpus/SOURCES.md:24` — teaches "Chrome's historical BiDi rollout claims as of 2023", anchor
  "last updated 2023-05-09, §Where are we now?", status mined.
- URL (row source cell, verbatim): `https://developer.chrome.com/blog/webdriver-bidi-2023`
- http 200, bytes 112335, body sha256
  `691ce80ffcc67eff9852ab7936560d9b25d9b3a78a4b8caebf60aa4c7632fbe2`
- Quote (found, offset 3222, 15/15 words):
  "In 2022, both Chrome/ChromeDriver 106 and Firefox 102 shipped support for the WebDriver BiDi standard."
  — `corpus/lessons/kaika-fleet-round-1.md:53`, §Where are we now?
- Anchor observed: "Last updated 2023-05-09 UTC" (still the page's only update marker); §Where are we now?
  still carries the 2022 Chrome 106 / Firefox 102 claim.
- Verdict `held`: the body still supports the teaches cell (historical 2023 baseline) at that section; no
  superseding row needed.

## S011 — held

- Row: `corpus/SOURCES.md:25` — teaches "Firefox 129 / Puppeteer 23 announcement and Chrome's continued CDP
  default", anchor "last updated 2024-08-07, §Firefox support, §CDP support in the future", status mined.
- URL (row source cell, verbatim):
  `https://developer.chrome.com/blog/firefox-support-in-puppeteer-with-webdriver-bidi`
- http 200, bytes 109287, body sha256
  `8eb1093e53dc813812347b2509ef225a1e9b557071d9be70f6412923a6d328e6`
- Quote (found, offset 2332, 12/12 words):
  "Firefox 129 and Puppeteer 23 each getting production-ready support for WebDriver BiDi!"
  — `corpus/lessons/kaika-fleet-round-1.md:54`, introduction
- Anchor observed: "Last updated 2024-08-07 UTC"; intro announces Firefox 129 / Puppeteer 23;
  §CDP support in the future still reads "for Chrome, Puppeteer will keep defaulting to CDP".
- Verdict `held`: both halves of teaches are still on the page (announcement + Chrome CDP default); no
  superseding row needed.
- Minor wording note (not drift): the body's headings are "Firefox, CDP, and Puppeteer" and "CDP support in
  the future" — the row anchor's "§Firefox support" is a paraphrase of that first heading, not a literal
  heading. The Gate quote's own location ("introduction") is accurate, so the quote is unaffected.

## Independent contract checks (my own, beyond the tool's exit 0)

Re-parsed both receipts against the C1 contract (`node --input-type=module -e ...` reading the receipts,
`corpus/SOURCES.md`, and each excerpt through the tool's `normalize`):

```
S010 rowUrlInCell=true quoteInExcerpt=true words=15/15 schema=tabi-source-recheck-v1
S011 rowUrlInCell=true quoteInExcerpt=true words=12/12 schema=tabi-source-recheck-v1
```

- `excerptSha256` recomputed with `sha256sum` matches the receipts:
  S010 excerpt `04f6f7d13661a9a857d9c1ba9c6fdf8176ea5b4043d13bc3ef89749774afeebe`,
  S011 excerpt `b5de9c737e679a9b7881b14e0ab848320ab80e8e7489164aba065efab590d5da`.
- `fetchedAt` 2026-10-20T19:05:38Z on both; `httpStatus` 200; `quoteFound` true; `teachesVerdict` `held`.

## Fetch-byte variance, characterized (not drift)

The lesson's seat-fetch digests (`corpus/lessons/kaika-fleet-round-1.md:53-54`:
`e457c166e6b8ebb172daa8c0a1c538b6467281b7eacca808f520736f62b11490` / `12dacd54a6edf34d5681e862b1021e9df0a4a3e90401fff1c52209b25c732326`)
do not equal any of today's raw body digests. I tested whether that is content change or transport noise by
fetching each page twice today with different curl settings and comparing the tool's normalized text:

```
s010 rawA 910e5d6363ea4e0a41a6fcd1b70c6464d72c7d95a1670f1317a337ab79746f5c rawB 9dedb90d2aa4a17e304ac647b0a8a96fd16e9f12f6df3c8ddf8ba8410b96dbac
s010 normalizedEqual=true normSha cea5029e89d5b487e67ae3ec30c1aa7b63d88c11bfec879fcd51936f44bc3fa1 len 7816
s011 rawA 18b1b719084e71ecbe1c7b359a8493d466b9e6183a71451c459e5bb8d0add6a2 rawB ce2eaecf8ca14fd627df973c43b7e9a6a0efa761ccfebfc4fbf3e1940ba2879f
s011 normalizedEqual=true normSha 51fbc23bb9f322fa2cb7936608c1f270d6fb510017c20173ef0607d42ca0de66 len 7429
```

Raw HTML differs per request (devsite embeds per-request bytes; UA/compression change the stream), while the
normalized article text is byte-identical within today's run and still contains both Gate quotes. So the
digest mismatch versus the 2026-10-19 seat fetch is [INFERENCE] transport/embedded-data noise, not observed
content drift; no body text supporting the teaches cells changed.

## Tooling installs

None. No pacman, `uv tool`, npm, or binary install was performed for this seat; the probe reused the
committed-round scaffold `recheck-fetch.mjs` with host `node` and `curl`.

## Files written

- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S010.json
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S010.excerpt.txt
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S011.json
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S011.excerpt.txt
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w1/Recheck05.md
