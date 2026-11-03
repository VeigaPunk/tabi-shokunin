# R57Reviewer — independent quarantine sample (S106, S142, S175)

Reviewer: R57Reviewer (attack seat). Method: my OWN guarded fetches, my OWN fold
ladder f0-f6, my OWN verdicts — produced before reading any quarantine seat's
receipt. Guards honored: http(s) scheme check, per-hop host resolution refusing
127/8, 10/8, 172.16/12, 192.168/16, 169.254/16, 0/8, 100.64/10, ::1, fe80::/10,
fc00::/7 (and IPv4-mapped forms), curl `--max-time 90 --max-filesize 25000000`,
GET only, no credentials. Ladder: f0 exact substring; f1 case-insensitive;
f2 whitespace-collapsed; f3 entities-decoded; f4 tags-stripped+f2; f5 f4+ci;
f6 punctuation/backtick-stripped+f2. Fetch driver + raw receipts: scratch
`fetch_ladder.py` (deleted at yield; per-row JSON copied below into this file).

Pairing cross-check (register row URL vs staged SOURCES.append.md row URL):
S106 rfc9309 == rfc9309; S142 rfc9110 == rfc9110; S175 np.com.tw storyid=20 ==
storyid=20. No staged/register URL divergence on any of my three rows.

## S106 (tabi | round1 | `payload-absent`) — my verdict: ABSENT-CONFIRMED

- Cited: https://www.rfc-editor.org/rfc/rfc9309.txt — HTTP 200, 25,265 B,
  text/plain;charset=utf-8 (byte-count matches the r32 re-fetch recorded in this
  lane's own search log: 25,265 B).
- Fragments: `使用 WebMCP 時，請注意下列事項` and `確認 WebMCP 工具曝光度` —
  0/2 located under f0-f6. The cited RFC contains **zero** CJK characters and
  zero `WebMCP` tokens; the quotes cannot be in it under any fold.
- Thematic check: the quotes are WebMCP usage notes; the cited source is the
  robots.txt exclusion RFC. The pairing is incoherent on its face.
- Quote-leak answer (QuarA contract step 5): BOTH fragments appear in
  `/home/vgpnk/Projects/shokuknow/merge/tabi/knowledge/corpus/knowledge/webmcp-agent-side-consumption.md`
  (`確認 WebMCP 工具曝光度` also in `webmcp-devtools-agent-surface-r25.md`).

### Cross-check vs R57QuarA (polled after my verdict was fixed)

QuarA verdict: **mispaired**; mine: **absent-confirmed**. FACTS AGREE —
QuarA's ladder also shows 0 hits in the cited RFC on identical bytes (25,265 B,
sha f633915d…b207), and I independently re-fetched their carrier
`https://developer.chrome.com/docs/devtools/agents/webmcp-debugging?hl=zh-tw`
(guard-checked; HTTP 200, 176,286 B) and confirmed BOTH fragments at f0 exact
(byte~147621 line 5631; byte~149035 line 5652). The disagreement is the LABEL:
the frozen contract defines `mispaired` as "a fragment located at the STAGED
url but not the register's" — here staged URL == register URL, so that trigger
does not fire; the frozen fallback for "clean 2xx, no fragment under the whole
ladder" is `absent-confirmed`. QuarA extended the vocabulary ("located at
another row's cited artifact") — factually richer, contractually out of the
frozen six. FINDING (verdict-vocabulary deviation, evidence agreement). Both
labels refuse the row; ADOPT-NOTHING outcome identical.

## S142 (tabi | round3 | `payload-absent`) — my verdict: ABSENT-CONFIRMED

- Cited: https://www.rfc-editor.org/rfc/rfc9110.txt — HTTP 200, 502,941 B,
  text/plain;charset=utf-8.
- Fragment: `which tool list do I see` — 0/1 under f0-f6 (also `tool list` and
  `do I see` individually absent; 3 stray CJK chars in the RFC, none relevant).
- Quote-leak answer: the fragment appears in
  `merge/tabi/knowledge/corpus/knowledge/webmcp-tool-listing-paths-r13.md`.
- QuarB counterpart: not landed at first pass; poll continues (disagreement =
  finding, agreement = corroboration).

## S175 (tabi | round5 | `payload-absent`) — my verdict: ABSENT-CONFIRMED AS WRITTEN, with a ONE-CHARACTER NEAR-MISS on fragment 1

- Cited: https://www.np.com.tw/modules/news/article.php?storyid=20 — HTTP 200,
  73,627 B, text/html; title matches the register row's source title
  (「WebMCP 完整解析：當 AI 代理不再需要「猜」你的網站」); the page is real and
  on-topic (45 `WebMCP` tokens) — this is NOT a soft-404.
- Fragment 1 (`WebMCP 沒有繞過任何既有防護。它吃的是瀏覽器當下的登入狀態，你的驗證碼、CSRF
  token、審核佪列、速率限制全部照常運作。`): 0 hits under f0-f6 — BUT the page
  carries the SAME sentence with 審核**佇**列 where the register row has 審核**佪**列
  (U+4F47 vs U+4F66). The one-character-corrected variant locates f0-exact at
  byte~39895, line 711. The register's quote cell carries a corrupted
  transcription, not a fabrication; the corrupted form also lives in the staged
  knowledge (`merge/tabi/knowledge/corpus/knowledge/webmcp-validation-and-confirmation-r15.md`
  contains 審核佪列 and `Explicit Tool Registration`), so the corruption entered
  at knowledge-mining and propagated to the register.
- Fragment 2 (`Explicit Tool Registration`): 0 hits under f0-f6; page has
  `Explicit` 0×, uses 註冊 (8×). Genuinely absent from the cited page.

### Cross-check vs R57QuarD (polled after my verdict was fixed)

QuarD verdict: **mispaired**; mine: **absent-confirmed (near-miss
documented)**. The factual ladders agree (0/2 fragments on the same
73,627-byte page), but QuarD's receipt has gaps: `reason` is null (the
contract requires one), `httpCode` is null while `bytes` is 73627 (fetched
but not recorded), and — unlike QuarA's S106 receipt — NO carrier evidence
for the `mispaired` label is recorded (no locatedElsewhere, no fold hits
anywhere). Under the frozen vocabulary, `mispaired` requires the STAGED url
to carry the text; here staged URL == register URL (np.com.tw storyid=20 on
both), so the frozen trigger cannot fire. FINDING (D2): QuarD's S175 verdict
label is unevidenced in its own receipt and out of the frozen vocabulary;
the receipt also omits the mandatory reason and the one-character near-miss
(佪列→佇列) that my variant probe recovered at byte~39895 line 711.
- QuarD counterpart: not landed at first pass; poll continues.

## Roll-up

| id | my verdict | counterpart | agreement? |
|---|---|---|---|
| S106 | absent-confirmed | QuarA: mispaired | FACTS agree; LABEL deviates from frozen vocabulary (finding) |
| S142 | absent-confirmed | QuarB: pending | — |
| S175 | absent-confirmed (near-miss documented) | QuarD: mispaired | FACTS agree (0/2 on same 73,627 B page); LABEL unevidenced + out of frozen vocabulary; receipt missing reason (finding D2) |

Campaign register rows checked: line 179 (S106), line 197 (S142 tabi), line 213
(S175) of absent-defect-register.md; staged rows SOURCES.append.md lines 11, 47,
80. ADOPT NOTHING (standing wave rule) — verdict receipts only.
