# ScoutQuarantine166 — quarantine hand-check, staged S166 (tabi round4)

## Row (read-only register, line 210)
`/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md`
`| tabi | round4 | S166 | payload-absent | https://weel.co.jp/media/tech/webmcp/ | `evaluate_webmcp` | ... |`
Register quote: `evaluate_webmcp` (the only quote). Class: payload-absent.

## Staging
`shokuknow/lanes/tabi/round4/SOURCES-PROPOSED.md` line 76 (S166 row), "Gate — S166" (line 78+): anchors §"検証1" and §"検証4"; staged quotes:
1. 検証環境はmacOS、Chrome 152（安定版）。
2. chrome://flags/#enable-webmcp-testingをEnabled にして再起動します。 ページの再読み込みでは反映されません 。
3. 同じ説明のツールを複数公開すると、どちらが呼ばれるかは制御できないようです。
4. No tools registered yet in https://www.expedia.co.jp/
`evaluate_webmcp` appears in staging ONLY in the S167 rows (CHANNELS.md:16, SOURCES-PROPOSED.md:86 S167 row, KNOWLEDGE-PROPOSED.md:173): it is S167's anchor (§"evaluate_webmcp" description of claude.com/ja/.../webmcp-evaluator). quote-lint-full-v5.json findings[1634] shows the ABSENT record's `line` field is the S167 row text ("| S167 | WebMCP Evaluator コネクター …"), i.e. the lint bound S167's quote to S166's id (binding: "id").

## Source access
- URL: https://weel.co.jp/media/tech/webmcp/ ; access date 2026-10-27 (curl -sSL, UA Mozilla/5.0)
- HTTP 200, text/html UTF-8, 299170 bytes, sha256 a55a48cbf0deaaf005c3c9d4fb8016a63c5ecf7ca5d89817d3aa1f036fd331ea; title "WebMCPとは？AIエージェント向けブラウザ標準の仕組み・特徴・使い方を徹底解説 | WEEL". Tag-stripped text 21950 chars.
- Observed: `evaluate_webmcp` 0 hits in raw HTML and tag-stripped text (also 0 for "evaluate", "evaluator", "Lighthouse"). Whitespace-insensitive search also false.
- Staged S166 quotes 1, 3, 4: exact match in tag-stripped text (and 1,3,4 in raw HTML). Quote 2: present after tag-strip/whitespace-normalisation (raw HTML splits it with markup around the link/emphasis, so raw substring miss is markup, not absence).
- Sections confirmed: 検証1 heading "検証1：ページにAIから呼べるツールを作る" contains quotes 1–2; 検証4 heading "検証4：実験参加を表明している大手サイトを見てみる" contains quote 4 ("上記のように表示され、ツールなし でした"); quote 3 sits in the 検証2 paragraph ("add_task_js ではなく宣言型の add_task … 説明文が同じでした。同じ説明のツールを複数公開すると…"), immediately before 検証3 — staging called it "the closing paragraph on two tools with the same description"; the anchor wording is loose (placed under 検証2, not 検証1/4) but the text is present.

## Located passage (≤25 words)
「検証環境はmacOS、Chrome 152（安定版）。」 / 「同じ説明のツールを複数公開すると、どちらが呼ばれるかは制御できないようです。」

## Classification
- Register's literal quote `evaluate_webmcp` in the S166 source: absent — but it is a checker mis-binding (S167's quote attributed to S166), not a fabrication by S166's staging.
- Row S166 as actually staged (four quotes): **present**. Not fabrication. Minor note: quote 3's staged section label (検証1/検証4) is loose; actual location is the 検証2 paragraph.
- Recommended register disposition: false-positive ABSENT (id mis-binding); no correction to S166 quotes required.

## Limitations
Single fetch of the live page on 2026-10-27 (page could differ from the 2026-10-23 staging fetch, but staged quotes still match). Line numbers (271/272/310/340) cited in staging not reproduced against the live HTML. No tools installed; no pacman; no writes to shokuknow. Scratch removed.

VERDICT finding S166 register row is a false-positive ABSENT: quote `evaluate_webmcp` belongs to S167 (id mis-binding) and is absent from the WEEL page, while all four actually staged S166 quotes are present in the fetched source (HTTP 200, 299170 bytes); classification: present
