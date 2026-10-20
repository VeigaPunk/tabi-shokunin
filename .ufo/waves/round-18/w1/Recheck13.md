VERDICT: PASS

# C1 freshness recheck — S026, S027 (seat Recheck13)

Lane tip read at start: `git -C /home/vgpnk/Projects/shokunin/tabi-shokunin rev-parse --verify refs/heads/master`
→ `2bff864fdfee684ddbcd066cc8e735adaba2735c` (B). No git/jj writes, no pacman, no tool installs
(node/curl already present; nothing needed). Both receipts written by
`.ufo/waves/round-18/recheck-fetch.mjs` alone, producer sha256
`f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360` (matches the digest in sibling
receipts). Decode probes were run first with `--normalize-only` on `/tmp` curl copies; both
`found=true`.

## S026 — Ketan Pardeshi answer to "How to give fixed wait in playwright without any condition"

- Row `corpus/SOURCES.md:40` (status `rejected`, tier C, scope "Post-action readiness in browser
  automation"; anchor cell "answer 74926242, 2022-12-27, re-read via Stack Exchange API 2026-10-19").
  Teaches: *Post-action readiness in browser automation*; note: *REJECTED: a bare 5-second sleep
  records no state transition and is not readiness evidence; flip: an explicitly time-based behavior
  test that keeps the state predicate as separate evidence*.
- Row URL (source cell) `https://stackoverflow.com/questions/74920905/how-to-give-fixed-wait-in-playwright-without-any-condition-like-we-had-in-cypress`
  → **HTTP 403**, 5,974 bytes, title "Just a moment..." (Cloudflare challenge), as the Gate already
  recorded. Body therefore read through the same route the row anchor names:
  `https://api.stackexchange.com/2.3/answers/74926242?site=stackoverflow&filter=withbody`.
- Receipt fetch: **HTTP 200, bytes 608**, decode `html-text`,
  sha256 `92326bb935ccc7a19f7f4b10593d8f3aec9e7481ceab4ca110275bdc4a973675`,
  fetchedAt `2026-10-20T19:06:38.522Z`. (The Gate's API digest `07242acd…12e6` is not reproduced
  because the default filter here also returns the owner object and quota counters; the answer body
  text is what is compared.)
- Original Gate quote `corpus/lessons/kaika-fleet-round-1.md:69` — found verbatim, offset 458,
  6 whitespace words (cap 25 not hit):
  "await new Promise(resolve => setTimeout(resolve, 5000));"
- Anchor observed: `answer_id 74926242`, `question_id 74920905` (matches the row's question URL),
  `creation_date 1672121925` = 2022-12-27T06:18:45Z, `last_activity_date 1672121925` (equal to
  creation, i.e. no later edit recorded), `is_accepted false`, `score 13`.
- Body: `"This is 5 sec timeout"` followed by the quoted `setTimeout` line and nothing else.
- **Verdict: held.** The body still offers exactly the bare 5-second sleep as the way to wait with
  no condition — the object the row rejects for recording no state transition. The teaches cell
  (the fixed-wait approach to post-action readiness) is what the body addresses, and the row's
  rejection is unchanged. No drift draft; no superseding row.

## S027 — Debugging with an existing browser instance, or Brave in VSCode

- Row `corpus/SOURCES.md:41` (status `rejected`, tier C, scope "Remote debugging against an everyday
  profile on Chrome ≥136"; anchor cell "post dated 2023-05-27, setup list adding
  `--remote-debugging-port=9222`"). Teaches: *Remote debugging against an everyday profile on Chrome
  ≥136*; note: *REJECTED: attaches port 9222 to the user's everyday browser profile, which S001
  refuses on branded Chrome ≥136 and tabi's shape-only session rule forbids; flip: the recipe
  updated to a dedicated `--user-data-dir`*.
- Row URL `https://duncanlock.net/blog/2023/05/27/debugging-with-an-existing-browser-instance-or-brave-in-vscode/`
  → **HTTP 200, bytes 19390**, decode `html-text`, sha256
  `e36d660b349e1db885701007e8977fa8cdc6017593074b07d44ad340a4c3cace`,
  fetchedAt `2026-10-20T19:06:38.930Z`. That digest is **byte-identical to the Gate seat fetch
  digest** (`corpus/lessons/kaika-fleet-round-1.md:70`), so the page has not changed since 2026-10-19.
- Quote: original Gate quote is "add \`--remote-debugging-port=9222\` on the end of the command line"
  — the backticks are markdown, not body text, and the normalizer does not strip them, so the receipt
  quote is the body form, offset 547, 9 words:
  "add --remote-debugging-port=9222 on the end of the command line"
- Anchor observed: byline date "Sat 27 th May, 2023", `datePublished 2023-05-27T09:51:30-07:00`
  (same 2023-05-27 post), body still a 1-minute TIL.
- Surrounding body text at the quote: "If you want to use an existing instance of a browser to debug
  in VSCode - instead of always launching a new one - you have to: Change the shortcut that you use
  to start the browser, to add --remote-debugging-port=9222 on the end of the command line, so that
  it always runs in \"debug ready\" mode." … "To debug web apps in VSCode with Brave - add this to
  your launch.js" (the launch config wildcard follows; no `--user-data-dir` anywhere in the body).
- **Verdict: held.** The recipe still attaches the debugging port to the browser the reader already
  starts (their everyday profile) and never introduces a dedicated profile. [INFERENCE] scope caveat
  stated explicitly: this page makes no Chrome-version claim — "Chrome ≥136" in the teaches cell is
  tabi's evaluation frame, taken from S001/S028 source enforcement, not a statement the 2023 post
  makes. That frame is unchanged and still the reason the row is rejected, so the cell is not read
  as an overstatement requiring a superseding row. No drift draft.

## Contract check (replica, run locally over the two receipt files)

For both rows, all of: schema `tabi-source-recheck-v1`; `row` present at `corpus/SOURCES.md`
(lines 40, 41); `rowUrl` verbatim inside that row's source cell; `sha256` 64-hex; `quoteWords`
equals the whitespace word count and is ≤25; `normalize(quote)` ⊂ `normalize(excerpt file)`;
`excerptSha256` = sha256 of the excerpt bytes; `quoteFound` true; `fetchedAt` 2026-10-20;
`teachesVerdict` held; `httpStatus` 200; `producerSha256` = current tool digest; `seat` `Recheck13`.
Result `ALL=true` for S026 and S027. No `--live` run was requested or performed.

- S026 excerpt sha256 `6fa03f6d6168309be5b927a426648a588eb08044b05dee869a425cbae6cd6570`
- S027 excerpt sha256 `2776ddad794e3ac3ec56ddd956a52eae0973a6ee5212bff4f70ddd00eb0403b6`

## Remaining unknowns / access notes

- S026: the question page stays behind a Cloudflare challenge for plain curl (403 today); the answer
  was read through the Stack Exchange API, which is the route the row's own anchor records. The API
  record carries no edit history, so a silent in-place edit before the Gate's 2026-10-19 reading
  cannot be excluded from the API alone — but `last_activity_date == creation_date` is observed, so
  no post-2022 edit is recorded. The answer body is 201 bytes of text; the recheck is bounded to it.
- S027: the page itself predates Chrome 136 and never discusses branded-Chrome profile refusal; that
  boundary is sourced from S001/S028, not from this row, and no new claim is made about it here.
- Neither row needed a drift draft, so no `S???` superseding row and no new Gate entry are proposed.

Files written:
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S026.json
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S026.excerpt.txt
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S027.json
- /home/vgpnk/Projects/shokunin/tabi-shokunin/corpus/evidence/round-18/source-recheck/S027.excerpt.txt
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w1/Recheck13.md
