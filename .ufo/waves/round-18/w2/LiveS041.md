VERDICT: PASS

# S041 C1 receipt — independent re-fetch (LiveS041-2, round 18 wave 2)

LANE: `/home/vgpnk/Projects/shokunin/tabi-shokunin`
Baseline B: `2bff864fdfee684ddbcd066cc8e735adaba2735c`
Measured candidate REV: `530f40a9bc3f10436161a2af1ca0fe9bffffc004`
Worktree state: `git rev-parse HEAD` = REV; `git status --porcelain` = only `?? .ufo/waves/round-18/w2/`
(read-only probe; no production, fleet, sibling, jj or Git-index write; no producer run into production).
Sandbox: `/tmp/tabi-s041-attack` (all probe writes live there).

## 1. Receipt under test

`corpus/evidence/round-18/source-recheck/S041.json` (REV), fields at these lines:

| Field | Value | Reproduced? |
|---|---|---|
| `schema` (:2) | `tabi-source-recheck-v1` | yes |
| `row` (:3) | `S041` | yes |
| `rowUrl` (:4) | `https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/public/devtools_protocol/domains/WebMCP.pdl` | occurs verbatim in `corpus/SOURCES.md:55` (`source.includes(rowUrl)` true) |
| `url` (:5) | same path `?format=TEXT` | allowed gitiles variant of the row URL |
| `fetchedAt` (:6) | `2026-10-20T19:07:33.707Z` | date 2026-10-20; before the REV committer time 2026-10-20T19:58:00Z |
| `command` (:7) | `curl -sSL --compressed --max-time 90 -A Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18 -o <tmp>/body -w %{http_code} '<url>'` | string-equal to the counter's canonical command |
| `httpStatus` (:8) | `200` | yes |
| `bytes` (:9) | `5292` | yes (`wc -c body`) |
| `sha256` (:10) | `0ea9bf3f3d06269e993b6d7367494843ae072c909ff2dde9a9ca3a47d84d47e4` | yes |
| `decode` (:11) | `base64` | yes |
| `quote` (:13) | `Unique identifier for this invocation. Response is sent before tool events.` | present |
| `quoteWords` (:14) | `11` | computed 11 |
| `quoteSource` (:15) | `corpus/lessons/round-17.md:53` | that line at REV contains the quote once (591-byte line) |
| `quoteFound` (:16) | `true` | yes |
| `quoteOffset` (:17) | `1951` | reproduced with the producer's `normalize()` |
| `excerpt` / `excerptSha256` (:18-19) | `S041.excerpt.txt` / `0a7e0c7314cf509770f32396a7631226e50bf67191b3ce11551d8f7b85042c24` | generated excerpt equals committed bytes exactly (1276 B) |
| `anchorObserved` (:20) | tag → commit `b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`, author/committer 2026-09-30; `Copyright 2026` line 1, `experimental domain WebMCP` line 7 | yes, independently |
| `teachesVerdict` (:21) | `held` | yes (see §3) |
| `seat` (:23) | `Recheck20` | matches `.ufo/waves/round-18/w1/Recheck20.md:5` |
| `producerSha256` (:24) | `f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360` | equals `sha256(git show REV:.ufo/waves/round-18/recheck-fetch.mjs)` |

The excerpt at REV is byte-identical to `normalize(decoded).slice(1951-600, 1951+quote+600) + "\n"`
(reproduced by importing the producer's `normalize` only; the producer CLI was never invoked and wrote
nothing). `corpus/evidence/round-18/source-recheck/S041.excerpt.txt` hash = receipt `excerptSha256`.

## 2. Re-fetch (exact argv)

```
mkdir -p /tmp/tabi-s041-attack && cd /tmp/tabi-s041-attack
curl -sSL --compressed --max-time 90 -A 'Mozilla/5.0 (X11; Linux x86_64) tabi-shokunin-recheck/18' \
  -o body -w '%{http_code} %{size_download} %{content_type}\n' \
  'https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97/third_party/blink/public/devtools_protocol/domains/WebMCP.pdl?format=TEXT'
```

Observed: `200 2173 text/plain; charset=utf-8`, curl exit 0.

- `wc -c body` = **5292**; `sha256sum body` =
  **`0ea9bf3f3d06269e993b6d7367494843ae072c909ff2dde9a9ca3a47d84d47e4`**.
  `%{size_download}` 2173 is the compressed wire size; `--compressed` decompresses to the 5292-byte
  file the producer digest covers. No mismatch.
- `base64 -d body > decoded` exit 0; `wc -c decoded` = **3969**; `wc -l decoded` = **123**;
  `sha256sum decoded` =
  **`26e62f2998c63798c81dc487cc14844b840e5dd2aafde1fd37a2e39ece0a37ff`** — exactly the decoded
  digest in `corpus/SOURCES.md:55` (`26e62f29…37ff`) and in `corpus/lessons/round-17.md:53`.

Quote location: decoded **line 68**, inside `command invokeTool` (**59**) `returns`:
```
68:      # Unique identifier for this invocation. Response is sent before tool events.
69:      string invocationId
```
All 11 words are one contiguous substring; normalized offset **1951**. An alternative rendering of the
same identity (`…WebMCP.pdl`, no `?format=TEXT`) was fetched as a cross-check: HTTP 200, 48249 B,
`sha256 9e78552f350304f19e3108466d48f03d55aba25b8df313c2e13b3738a67e7744`, quote occurs once,
line ids 26/59/110/115. This cross-check was not used to replace the base64 evidence.

## 3. Does the quote support `teaches`?

`teaches` (`corpus/SOURCES.md:55`): "invokeTool returns an invocationId before any tool event, so the
outcome including Canceled arrives only in toolResponded".

- Clause 1 (`invokeTool` returns an `invocationId` before any tool event): the quote is the comment on
  the `string invocationId` return at 68-69 and states exactly that the command response is sent before
  tool events. Direct support.
- Clause 2 (outcome, including `Canceled`, arrives only in `toolResponded`): the quote alone does not
  state it; the anchor does. Verified at the same tag: `event toolInvoked` (98-107) carries only
  `toolName`, `frameId`, `invocationId`, `input` and no status; `command cancelInvocation` (72-76)
  returns nothing; the only `InvocationStatus` use is `event toolResponded` (110), field
  `InvocationStatus status` (115); the enum is at 26-30 with `Completed` (28), `Canceled` (29),
  `Error` (30). No other domain element carries an outcome/status. The "only" is therefore a
  structural inference from a complete domain definition, not a sentence — but it is supported, with
  no counterexample in this PDL.
- `teachesVerdict: held` is correct for S041. The receipt's `note` (:22) line numbers all check out
  (59, 68-69, 72, 78, 92, 98, 110, 26-30).

## 4. Source identity / anchor: held

- Tag resolution `curl -sSL --compressed --max-time 90 -A '…tabi-shokunin-recheck/18' -o tag.json -w '%{http_code} %{size_download}' 'https://chromium.googlesource.com/chromium/src/+/refs/tags/154.0.8037.97?format=JSON'`
  → **200 2334**, sha256 `02dbdcc41ba2173756c2728a232765ca9165f14e7ad922bf9535f881111cb264`;
  `commit b510e9d7cd3a2fbd78d0ddc42234103206c5f78d`, `tree e096b0852a79b0810dba5cfaa714c95d74908532`,
  author/committer `Wed Sep 30 21:20:00 2026`. Matches `anchorObserved` and `SOURCES.md:55`.
- File at that commit (`…/+/b510e9d7…/…/WebMCP.pdl?format=TEXT`) → 200, 2173 wire; as-served body
  sha256 `0ea9bf3f…d47e4` and decoded sha256 `26e62f29…37ff`; `cmp decoded commit_decoded` exit 0
  ("tag-bytes == commit-bytes"). The tag did not move between the tag and the commit fetch.
- Alternative rendering contains the quote and the same line anchors (§2).
- No unreachable, no drift. The row anchor's `lines 7 and 58-122, sha256 26e62f29…37ff` is true:
  line 7 is `experimental domain WebMCP`; 58 is the `# Invokes a registered tool.` comment preceding
  `invokeTool` (59); 110-115 is `toolResponded`/`status`; 122 is inside its parameter list.

## 5. Immutable availability vs live product freshness (the asked attack)

S041's URL is a **pinned tag**, so re-fetching it establishes (a) the tag still resolves to
`b510e9d7…`, and (b) the served bytes still match the recorded digests. It does **not** by itself
establish anything about the current release or `main`. The round-18 artifacts are explicit about
that scope:

- `corpus/knowledge/source-recheck-round-18.md:110` classifies S041 as **Pinned**; `:123` says no drift
  in this round; `:141` says "They say nothing about how any product behaves, and the 51 rows are not a
  statement of current live product support"; `:140` says quote presence is not claim truth.
- `corpus/lessons/round-18.md:12-16` defines C1 as "integrity-checked recheck receipts, not overdue
  rows or current product support"; `:31` rejects the overdue-repair framing ("no row is date-due").
- `corpus/knowledge/source-recheck-round-18.md:3` says a row's own `recheck` cell governs; `:7` says
  "no row's `recheck` cell was past due on this date". `corpus/SOURCES.md:55` has `on-release`.
- The counter prints `freshness_scope: "round-18 receipt date 2026-10-20 only; not a reusable
  freshness due-date gate"` (`measure-c1.mjs:471`).
- Historical freshness semantics are source re-verification, not product currency:
  `SCORECARD.md:476` ("bounded source re-verification") and `:482` ("bounded source-claim rechecks").

I checked the current stable release instead of stopping at the disclaimer. Chromium stable
`155.0.8059.84` (released 2026-10-15, per `.ufo/waves/round-18/w1/ReconRecheckDue.md:75-76`) is one
release beyond the row's tag. Fetching the same PDL at that tag:
`…/+/refs/tags/155.0.8059.84/…/WebMCP.pdl?format=TEXT` → 200, decoded **3969 B**, sha256
**`26e62f2998c63798c81dc487cc14844b840e5dd2aafde1fd37a2e39ece0a37ff`**, `diff` against the 154 decoded
file exit **0** — **byte-identical**. So the row's teaches remains true at the current stable tag as of
2026-10-20; the tag-currency observation "one stable behind" (ReconRecheckDue.md:166 "not due [L];
[A] yes") is a tag-name/currency reading, not a content change for `WebMCP.pdl`.

Finite counterexample that the pinned receipt cannot see branch drift: `main` today
(`https://raw.githubusercontent.com/chromium/chromium/main/third_party/blink/public/devtools_protocol/domains/WebMCP.pdl`)
→ 200, 4126 B, sha256 `f386bcfd036328f1fb1572b5404bfad09a7f6ff078093241fbc3409a1036f99f`, `diff` vs 154
exit 1 with exactly one hunk: after the `consequential` annotation it adds
`optional boolean debugging`. `main` is not S041's target and no product behavior is claimed; but a
re-fetch of the immutable 154 tag cannot detect this, so no reader should cite S041's receipt as
"current `main`/product freshness". The note's own `:141` disclaimer already forbids that reading.

Conclusion: the receipt is not confused with live product freshness, and the round's operative claim
is scoped (source re-verification at the cited anchor). Residual method limit: the counter's
`row_classes.url` at REV counts 17 `immutable_pinned` rows among 64 (see §6); their receipts are
availability/identity checks, not drift detectors. That is disclosed by the note's §4, not a defect in
S041.

## 6. Counter and global receipt integrity

- At B (`node .ufo/waves/round-18/measure-c1.mjs 2bff864…`, exit 0):
  `c1_rows_rechecked:0, eligible_rows:51, held:0, own_work:0, rejected:[]`, URL classes
  `immutable_pinned:14/living_live:42/own_work:1`.
- At REV (`node .ufo/waves/round-18/measure-c1.mjs 530f40a9…`, exit 0):
  `c1_rows_rechecked:51, eligible_rows:58, held:50, drift_superseded:0, own_work:1, rejected:[]`,
  URL classes `immutable_pinned:17/living_live:46/own_work:1`, `counterSha256`
  `df7999858aa0c75b60455f9ea9803cc4b629e4863d1357016220512b5df56234`.
  `eligible_rows` is 58 at REV because S058–S064 were opened this round; the C1 target is the fixed
  baseline set of 51 (`PLAN.md:15-21`, `lessons/round-18.md:13`), and all 51 receipt rows are accepted.
  The counter's `held:50` excludes own-work S029 from the freshness class; the receipt JSON itself has
  51 `teachesVerdict:"held"` (the note's §2 field count). This is the documented own-work exclusion,
  not a mismatch in S041.
- Receipt directory audit (REV): 102 files = 51 `.json` + 51 `.excerpt.txt`; 51 distinct rows; no
  duplicate; 51 `held`; 0 `drift`; 51 `quoteFound`; every `fetchedAt` on 2026-10-20; one producer
  `f2ba0033…aa360`; no extra files. This independently confirms the note's `:11-13` and §2 counts,
  including S041.
- Full digests: producer at REV `f2ba0033323a3806f62697d6cff52c1916d6c4d4ffd44a6fa9760d63e6eaa360`;
  excerpt `0a7e0c7314cf509770f32396a7631226e50bf67191b3ce11551d8f7b85042c24`; receipt body
  `0ea9bf3f3d06269e993b6d7367494843ae072c909ff2dde9a9ca3a47d84d47e4`; decoded
  `26e62f2998c63798c81dc487cc14844b840e5dd2aafde1fd37a2e39ece0a37ff`.

## 7. Non-blocking documentation caveats (not S041 receipt defects)

- `corpus/knowledge/source-recheck-round-18.md:11` says "`corpus/SOURCES.md` has 57 rows (S001–S057)"
  in the present tense; at REV the file has **64** rows (`git show REV:corpus/SOURCES.md | grep -c '^| S0'`
  = 64; the counter reports 64 via its kind/status/url totals). The sentence is baseline-scoped (the
  same paragraph says "at baseline B", and the note's `source:` line names the 51 B rows); it should
  say "at baseline B" if cited at REV.
- `corpus/knowledge/source-recheck-round-18.md:110` says the pinned receipt "records bytes only, not
  the commit served"; for S041 the receipt's `anchorObserved` (:20) does name the commit. §6 `:140`
  correctly treats `anchorObserved` as free text, and I re-resolved the tag independently (§4).
- `PLAN.md:15-16` says "re-verified against their live source" without the pinned/live qualifier; the
  lesson, note §4/§6, and counter `freshness_scope` supply it. No false claim, but the one-line plan
  wording alone would over-read a pinned-tag re-fetch.

## 8. Residual unknowns / limits

- The counter's `--live` 51-source sweep was not run; the exact S041 URL was re-fetched with the same
  `curl -sSL --compressed --max-time 90` flags and UA as the receipt (the `-w` format was extended to
  `%{http_code} %{size_download} %{content_type}` for observation), and the quote, digests, tag and
  commit were checked. This is a stronger check for S041 than a quote-only live mode, but it is one
  source, not the other 50.
- The exact `fetchedAt` wall time (19:07:33.707Z) is not independently observable from the server; the
  date, the pre-commit ordering (19:07Z < 19:58Z committer), and the present-day re-fetch were checked.
- `anchorObserved` is free text; independently re-derived (tag JSON → commit → file).
- The HTML rendering's 48249-byte body digest is representation-specific and is not compared with the
  base64 body; the quote and line anchors were compared.
- The 155-tag check shows the cited file is unchanged at current stable; it is not a general claim that
  every S041-adjacent source is unchanged.
- No tools were installed or updated (pacman/uv/npx untouched); no production producer was run.

Files written:
- /home/vgpnk/Projects/shokunin/tabi-shokunin/.ufo/waves/round-18/w2/LiveS041.md
